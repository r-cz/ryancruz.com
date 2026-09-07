import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'

export interface Aircraft {
  group: THREE.Group
  update(elapsed: number): void
  dispose(): void
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
    gltf.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true
        object.receiveShadow = true
      }
    })
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
