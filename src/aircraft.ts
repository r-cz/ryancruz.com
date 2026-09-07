import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

export interface Aircraft {
  group: THREE.Group
  update(elapsed: number): void
  dispose(): void
}

/** Bake the static model once, keeping distinct livery materials intact. */
function batchStaticMeshes(scene: THREE.Group, scenes: THREE.Group[]) {
  scene.updateMatrixWorld(true)
  const inverse = scene.matrixWorld.clone().invert()
  const batches = new Map<string, THREE.Mesh[]>()
  scene.traverse((object) => {
    if (
      !(object instanceof THREE.Mesh) ||
      object instanceof THREE.SkinnedMesh ||
      Array.isArray(object.material) ||
      object.material.transparent ||
      Object.keys(object.geometry.morphAttributes).length ||
      object.geometry.drawRange.start !== 0 ||
      object.geometry.drawRange.count !== Infinity
    )
      return
    // Attribute sets and sizes must agree; decoded values are baked to floats.
    const geometry: THREE.BufferGeometry = object.geometry
    const attributes = Object.entries(geometry.attributes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, attribute]) => `${name}:${attribute.itemSize}`)
      .join(',')
    const key = `${object.material.uuid}:${attributes}`
    const batch = batches.get(key) ?? []
    batch.push(object)
    batches.set(key, batch)
  })
  const replaced = new Set<THREE.BufferGeometry>()
  for (const meshes of batches.values()) {
    if (meshes.length < 2) continue
    const geometries = meshes.map((mesh) => {
      const baked = new THREE.BufferGeometry()
      for (const [name, attribute] of Object.entries(mesh.geometry.attributes)) {
        // In particular, expand packed Int8 normals before transforming them so
        // baking introduces no second round of normal quantization.
        const values = new Float32Array(attribute.count * attribute.itemSize)
        for (let vertex = 0; vertex < attribute.count; vertex++)
          for (let component = 0; component < attribute.itemSize; component++)
            values[vertex * attribute.itemSize + component] = attribute.getComponent(
              vertex,
              component,
            )
        baked.setAttribute(name, new THREE.BufferAttribute(values, attribute.itemSize))
      }
      baked.setIndex(
        mesh.geometry.index?.clone() ??
          Array.from({ length: baked.attributes.position.count }, (_, index) => index),
      )
      const transform = new THREE.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld)
      baked.applyMatrix4(transform)
      if (transform.determinant() < 0) {
        // WebGL flips front-face winding for mirrored objects. Once their
        // transform is baked into vertices, preserve that correction explicitly.
        const indices = baked.getIndex()
        if (indices)
          for (let index = 0; index < indices.count; index += 3) {
            const second = indices.getX(index + 1)
            indices.setX(index + 1, indices.getX(index + 2))
            indices.setX(index + 2, second)
          }
        const tangent = baked.getAttribute('tangent')
        if (tangent)
          for (let vertex = 0; vertex < tangent.count; vertex++)
            tangent.setW(vertex, -tangent.getW(vertex))
      }
      return baked
    })
    const merged = mergeGeometries(geometries)
    geometries.forEach((geometry) => geometry.dispose())
    if (!merged) continue
    const mesh = new THREE.Mesh(merged, meshes[0].material)
    mesh.name = `Aircraft material: ${(meshes[0].material as THREE.Material).name}`
    merged.computeBoundingSphere()
    scene.add(mesh)
    for (const original of meshes) {
      replaced.add(original.geometry)
      original.removeFromParent()
    }
  }
  // Shared geometry may still belong to an unbatched mesh or another GLTF scene.
  scenes.forEach((root) =>
    root.traverse((object) => {
      if (object instanceof THREE.Mesh) replaced.delete(object.geometry)
    }),
  )
  const groups: THREE.Group[] = []
  scene.traverse((object) => {
    if (object instanceof THREE.Group && object !== scene) groups.push(object)
    object.updateMatrix()
    object.matrixAutoUpdate = false
  })
  groups.reverse().forEach((group) => {
    if (!group.children.length) group.removeFromParent()
  })
  replaced.forEach((geometry) => geometry.dispose())
}

function addContactShadow(scene: THREE.Group) {
  const bounds = new THREE.Box3().setFromObject(scene)
  if (bounds.isEmpty()) return
  const size = bounds.getSize(new THREE.Vector3())
  const center = bounds.getCenter(new THREE.Vector3())
  const resolution = 128
  const pixels = new Uint8Array(resolution * resolution * 4)
  for (let row = 0; row < resolution; row++)
    for (let column = 0; column < resolution; column++) {
      const x = (column + 0.5) / resolution - 0.5
      const z = (row + 0.5) / resolution - 0.5
      const fuselage = Math.exp(-2 * ((x / 0.43) ** 2 + (z / 0.065) ** 2))
      const wings = Math.exp(-2 * (((x + 0.04 - Math.abs(z) * 0.3) / 0.1) ** 2 + (z / 0.4) ** 2))
      const tail = Math.exp(-2 * (((x - 0.35) / 0.07) ** 2 + (z / 0.19) ** 2))
      const fade = Math.max(0, 1 - (Math.max(Math.abs(x), Math.abs(z)) / 0.5) ** 8)
      const offset = (row * resolution + column) * 4
      pixels.set([255, 255, 255, Math.round(Math.max(fuselage, wings, tail) * fade * 255)], offset)
    }
  const texture = new THREE.DataTexture(pixels, resolution, resolution)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.needsUpdate = true
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(size.x * 1.15, size.z * 1.15),
    new THREE.MeshBasicMaterial({
      map: texture,
      color: '#17202b',
      opacity: 0.2,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  )
  shadow.name = 'Aircraft contact shadow'
  shadow.rotation.x = -Math.PI / 2
  shadow.position.set(center.x, bounds.min.y + 0.006, center.z)
  shadow.updateMatrix()
  shadow.matrixAutoUpdate = false
  scene.add(shadow)
}

function disposeScenes(scenes: THREE.Object3D[]) {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()
  const images = new Set<{ close(): void }>()
  for (const scene of scenes) {
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      geometries.add(object.geometry)
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        materials.add(material)
        for (const value of Object.values(material)) {
          if (!(value instanceof THREE.Texture)) continue
          textures.add(value)
          // GLTFLoader may decode embedded textures into closeable ImageBitmaps.
          const image = value.source.data
          for (const entry of Array.isArray(image) ? image : [image]) {
            if (entry && typeof entry.close === 'function') images.add(entry)
          }
        }
      }
    })
  }
  geometries.forEach((geometry) => geometry.dispose())
  materials.forEach((material) => material.dispose())
  textures.forEach((texture) => texture.dispose())
  images.forEach((image) => image.close())
  scenes.forEach((scene) => scene.clear())
}

/** Load Daniel Skomorovsky's Southwest 737, optimized locally from the supplied FBX. */
export function createAircraft(onChange: () => void = () => {}): Aircraft {
  const group = new THREE.Group()
  group.name = 'Southwest Airlines Boeing 737'
  group.userData.loadState = 'loading'
  const controller = new AbortController()
  let disposed = false
  let loadedScenes: THREE.Group[] = []

  async function load() {
    const response = await fetch('/models/southwest-737.glb?v=2', { signal: controller.signal })
    if (disposed) return
    if (!response.ok) throw new Error(`Aircraft request failed (${response.status})`)
    const data = await response.arrayBuffer()
    if (disposed) return
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
    const gltf = await loader.parseAsync(data, '/models/')
    const scenes = [...new Set([gltf.scene, ...gltf.scenes])]
    // Decoding cannot be aborted, so release a result that arrives after teardown.
    if (disposed) {
      disposeScenes(scenes)
      return
    }
    loadedScenes = scenes
    batchStaticMeshes(gltf.scene, scenes)
    gltf.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        // The terminal's sun map is cached. A moving contact shadow below keeps
        // the aircraft grounded without leaving a stale silhouette in that map.
        object.castShadow = false
        object.receiveShadow = true
      }
    })
    addContactShadow(gltf.scene)
    group.add(gltf.scene)
    group.userData.loadState = 'ready'
    // Request one frame even when ambient motion is paused or reduced.
    onChange()
  }

  void load().catch(() => {
    // A missing aircraft should leave the terminal and portfolio fully usable.
    if (!disposed) group.userData.loadState = 'unavailable'
  })

  return {
    group,
    update() {
      // Taxi movement is applied to this group by the terminal environment.
    },
    dispose() {
      if (disposed) return
      disposed = true
      controller.abort()
      disposeScenes(loadedScenes)
      loadedScenes = []
      group.clear()
      group.userData.loadState = 'disposed'
    },
  }
}
