import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { createAircraft, type Aircraft } from './aircraft'

const aircraft: Aircraft[] = []
const start = (onChange = () => {}) => {
  const result = createAircraft(onChange)
  aircraft.push(result)
  return result
}
const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

function deferred<T>() {
  let resolve: (value: T) => void = () => {}
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

function fixture() {
  const close = mock(() => {})
  const texture = new THREE.Texture({ close })
  const material = new THREE.MeshStandardMaterial({ map: texture, emissiveMap: texture })
  const secondMaterial = new THREE.MeshStandardMaterial({ map: texture })
  const geometry = new THREE.BoxGeometry()
  const mesh = new THREE.Mesh(geometry, [material, secondMaterial])
  const scene = new THREE.Group()
  scene.add(mesh, new THREE.Mesh(geometry, material))
  const unusedScene = new THREE.Group()
  unusedScene.add(new THREE.Mesh(geometry, secondMaterial))
  const gltf = { scene, scenes: [scene, unusedScene] } as GLTF
  return {
    gltf,
    scene,
    unusedScene,
    mesh,
    close,
    geometryDispose: spyOn(geometry, 'dispose'),
    materialDispose: spyOn(material, 'dispose'),
    secondMaterialDispose: spyOn(secondMaterial, 'dispose'),
    textureDispose: spyOn(texture, 'dispose'),
  }
}

async function loadShippedAircraft() {
  const bytes = await Bun.file(
    new URL('../public/models/southwest-737.glb', import.meta.url),
  ).arrayBuffer()
  spyOn(globalThis, 'fetch').mockResolvedValue(new Response(bytes))
  const ready = deferred<void>()
  const value = start(() => ready.resolve())
  await ready.promise
  value.group.updateMatrixWorld(true)
  return value
}

function hitMaterialName(hit: THREE.Intersection) {
  if (!(hit.object instanceof THREE.Mesh)) return undefined
  const material = Array.isArray(hit.object.material)
    ? hit.object.material[hit.face?.materialIndex ?? 0]
    : hit.object.material
  return material?.name
}

function requestSucceeds() {
  return spyOn(globalThis, 'fetch').mockResolvedValue(new Response(new Uint8Array([1, 2, 3])))
}

function modelMetrics(group: THREE.Object3D) {
  group.updateMatrixWorld(true)
  const bounds = new THREE.Box3()
  const materials = new Map<THREE.Material, { triangles: number; bounds: THREE.Box3 }>()
  let meshes = 0
  group.traverse((object) => {
    if (!(object instanceof THREE.Mesh) || object.name === 'Aircraft contact shadow') return
    meshes++
    const geometry: THREE.BufferGeometry = object.geometry
    const worldBounds = new THREE.Box3()
    const point = new THREE.Vector3()
    const positions = geometry.attributes.position
    for (let vertex = 0; vertex < positions.count; vertex++)
      worldBounds.expandByPoint(
        point.fromBufferAttribute(positions, vertex).applyMatrix4(object.matrixWorld),
      )
    bounds.union(worldBounds)
    if (Array.isArray(object.material)) throw new Error('Expected one material per model mesh')
    const stats = materials.get(object.material) ?? { triangles: 0, bounds: new THREE.Box3() }
    stats.triangles += (geometry.index?.count ?? geometry.attributes.position.count) / 3
    stats.bounds.union(worldBounds)
    materials.set(object.material, stats)
  })
  return { meshes, bounds, materials }
}

afterEach(async () => {
  aircraft.splice(0).forEach((value) => value.dispose())
  await settle()
  mock.restore()
})

describe('downloaded aircraft lifecycle', () => {
  it('decodes the shipped Meshopt asset at terminal scale', async () => {
    const value = await loadShippedAircraft()
    const { bounds, meshes, materials } = modelMetrics(value.group)
    const size = bounds.getSize(new THREE.Vector3())
    const triangles = [...materials.values()].reduce((sum, value) => sum + value.triangles, 0)
    // Allow the small bounds changes introduced by geometry simplification.
    expect(size.x).toBeGreaterThan(10.7)
    expect(size.x).toBeLessThan(11.3)
    expect(size.y).toBeGreaterThan(3.4)
    expect(size.y).toBeLessThan(3.7)
    expect(size.z).toBeGreaterThan(9.8)
    expect(size.z).toBeLessThan(10.2)
    expect(Math.abs(bounds.min.y)).toBeLessThan(0.02)
    expect(triangles).toBeGreaterThan(80000)
    expect(triangles).toBeLessThan(90000)
    expect(meshes).toBe(34)
  })
  it('retains engine exhausts, stabilizers and visible tire and hub faces on both sides', async () => {
    const value = await loadShippedAircraft()
    for (const side of [-1, 1]) {
      // These rays pass through the sidewalls rather than the tread. The source
      // has inward-facing wheel surfaces that must also be visible from outside.
      const tires = new THREE.Raycaster(
        new THREE.Vector3(0.02, 0.28, side * 2),
        new THREE.Vector3(0, 0, -side),
        0,
        1.5,
      )
        .intersectObject(value.group, true)
        .filter((hit) => hitMaterialName(hit) === 'Material7')
      expect(tires.some(({ point }) => Math.abs(point.z) > 0.82)).toBe(true)
      expect(tires.some(({ point }) => Math.abs(point.z) > 0.6 && Math.abs(point.z) < 0.75)).toBe(
        true,
      )
      const hubs = new THREE.Raycaster(
        new THREE.Vector3(0.02, 0.1, side * 2),
        new THREE.Vector3(0, 0, -side),
        0,
        1.5,
      )
        .intersectObject(value.group, true)
        .filter((hit) => hitMaterialName(hit) === 'Material1')
      expect(hubs.some(({ point }) => Math.abs(point.z) > 0.82)).toBe(true)
      expect(hubs.some(({ point }) => Math.abs(point.z) > 0.6 && Math.abs(point.z) < 0.75)).toBe(
        true,
      )

      // Single-material engine aft sections were accidentally omitted when the
      // exporter received a material array without matching geometry groups.
      const exhaustHits = new THREE.Raycaster(
        new THREE.Vector3(1, 0.55, side * 1.37),
        new THREE.Vector3(-1, 0, 0),
        0,
        4,
      )
        .intersectObject(value.group, true)
        .filter((hit) => hitMaterialName(hit) === '0135_DarkGray')
      expect(exhaustHits.length).toBeGreaterThan(0)
      const stabilizerHits = new THREE.Raycaster(
        new THREE.Vector3(5, 3, side * 1.3),
        new THREE.Vector3(0, -1, 0),
        0,
        3,
      ).intersectObject(value.group, true)
      expect(stabilizerHits.length).toBeGreaterThan(0)
    }
  })

  it('batches the shipped model without losing geometry or changing any livery material', async () => {
    const gltf = await new GLTFLoader()
      .setMeshoptDecoder(MeshoptDecoder)
      .parseAsync(
        await Bun.file(
          new URL('../public/models/southwest-737.glb', import.meta.url),
        ).arrayBuffer(),
        '/models/',
      )
    const original = modelMetrics(gltf.scene)
    requestSucceeds()
    spyOn(GLTFLoader.prototype, 'parseAsync').mockResolvedValue(gltf)
    const value = start()
    await settle()
    const batched = modelMetrics(value.group)

    expect(original.meshes).toBe(133)
    expect(batched.meshes).toBe(34)
    expect(batched.materials.size).toBe(original.materials.size)
    for (const [material, before] of original.materials) {
      const after = batched.materials.get(material)
      if (!after) throw new Error(`Lost aircraft material ${material.name}`)
      expect(after.triangles).toBe(before.triangles)
      expect(after.bounds.min.distanceTo(before.bounds.min)).toBeLessThan(0.00001)
      expect(after.bounds.max.distanceTo(before.bounds.max)).toBeLessThan(0.00001)
    }
  })

  it('preserves outward faces through mirrored, nested transforms and releases baked resources', async () => {
    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshStandardMaterial({ color: '#123456' })
    const scene = new THREE.Group()
    const parent = new THREE.Group()
    parent.position.set(1, 0.4, -2)
    parent.rotation.y = 0.35
    scene.add(parent)
    const first = new THREE.Mesh(geometry, material)
    first.position.x = -1.5
    const mirrored = new THREE.Mesh(geometry, material)
    mirrored.position.x = 1.5
    mirrored.scale.set(-0.8, 1.2, 0.7)
    mirrored.rotation.y = -0.5
    parent.add(first, mirrored)
    scene.updateMatrixWorld(true)
    const rays = [first, mirrored].flatMap((mesh) =>
      [1, -1].map(
        (side) =>
          new THREE.Raycaster(
            mesh.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0, side * 4)),
            new THREE.Vector3(0, 0, -side),
          ),
      ),
    )
    const distances = rays.map((ray) => ray.intersectObject(scene, true)[0]?.distance)
    expect(distances.every((distance) => distance !== undefined)).toBe(true)
    const originalDispose = spyOn(geometry, 'dispose')
    const materialDispose = spyOn(material, 'dispose')
    requestSucceeds()
    spyOn(GLTFLoader.prototype, 'parseAsync').mockResolvedValue({ scene, scenes: [scene] } as GLTF)
    const value = start()
    await settle()
    value.group.updateMatrixWorld(true)
    const meshes: THREE.Mesh[] = []
    value.group.traverse((object) => {
      if (object instanceof THREE.Mesh && object.name !== 'Aircraft contact shadow')
        meshes.push(object)
    })

    expect(meshes).toHaveLength(1)
    rays.forEach((ray, index) => {
      expect(ray.intersectObjects(meshes)[0]?.distance).toBeCloseTo(distances[index] ?? 0, 5)
    })
    expect(originalDispose).toHaveBeenCalledTimes(1)
    expect(materialDispose).not.toHaveBeenCalled()
    const mergedDispose = spyOn(meshes[0].geometry, 'dispose')
    value.dispose()
    value.dispose()
    expect(originalDispose).toHaveBeenCalledTimes(1)
    expect(mergedDispose).toHaveBeenCalledTimes(1)
    expect(materialDispose).toHaveBeenCalledTimes(1)
  })

  it('moves a soft contact shadow with the aircraft without invalidating cached sun shadows', async () => {
    const value = await loadShippedAircraft()
    const shadow = value.group.getObjectByName('Aircraft contact shadow')
    if (!(shadow instanceof THREE.Mesh) || !(shadow.material instanceof THREE.MeshBasicMaterial))
      throw new Error('Missing aircraft contact shadow')
    const texture = shadow.material.map
    if (!(texture instanceof THREE.DataTexture)) throw new Error('Missing contact shadow mask')
    const model = modelMetrics(value.group)
    const originalPosition = shadow.getWorldPosition(new THREE.Vector3())
    expect(originalPosition.y - model.bounds.min.y).toBeCloseTo(0.006, 5)
    expect(shadow.material.transparent).toBe(true)
    expect(shadow.material.depthWrite).toBe(false)
    const alphas = Array.from(texture.image.data).filter((_value, index) => index % 4 === 3)
    expect(Math.min(...alphas)).toBe(0)
    expect(Math.max(...alphas)).toBeGreaterThan(200)
    value.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      expect(object.castShadow).toBe(false)
      if (object !== shadow) expect(object.receiveShadow).toBe(true)
    })
    value.group.position.x += 4
    value.group.updateMatrixWorld(true)
    const moved = shadow.getWorldPosition(new THREE.Vector3())
    expect(moved.x - originalPosition.x).toBeCloseTo(4, 6)
    expect(moved.y).toBe(originalPosition.y)
    const textureDispose = spyOn(texture, 'dispose')
    const geometryDispose = spyOn(shadow.geometry, 'dispose')
    const materialDispose = spyOn(shadow.material, 'dispose')
    value.dispose()
    value.dispose()
    expect(textureDispose).toHaveBeenCalledTimes(1)
    expect(geometryDispose).toHaveBeenCalledTimes(1)
    expect(materialDispose).toHaveBeenCalledTimes(1)
  })

  it('loads the compressed model and requests one frame without an animation loop', async () => {
    const result = fixture()
    const fetch = requestSucceeds()
    const parse = spyOn(GLTFLoader.prototype, 'parseAsync').mockResolvedValue(result.gltf)
    const decoder = spyOn(GLTFLoader.prototype, 'setMeshoptDecoder')
    const onChange = mock(() => {})
    const value = start(onChange)
    value.update(50)
    expect(value.group.children).toHaveLength(0)
    await settle()

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0]?.[0]).toBe('/models/southwest-737.glb?v=2')
    expect(fetch.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal)
    expect(decoder).toHaveBeenCalledWith(MeshoptDecoder)
    expect(parse).toHaveBeenCalledTimes(1)
    expect(parse.mock.calls[0]?.[1]).toBe('/models/')
    expect(value.group.children).toEqual([result.scene])
    expect(result.mesh.castShadow).toBe(false)
    expect(result.mesh.receiveShadow).toBe(true)
    expect(value.group.userData.loadState).toBe('ready')
    expect(onChange).toHaveBeenCalledTimes(1)
    value.update(100)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('releases shared geometry, materials, textures and decoded images exactly once', async () => {
    const result = fixture()
    requestSucceeds()
    spyOn(GLTFLoader.prototype, 'parseAsync').mockResolvedValue(result.gltf)
    const value = start()
    await settle()
    value.dispose()
    value.dispose()

    expect(result.geometryDispose).toHaveBeenCalledTimes(1)
    expect(result.materialDispose).toHaveBeenCalledTimes(1)
    expect(result.secondMaterialDispose).toHaveBeenCalledTimes(1)
    expect(result.textureDispose).toHaveBeenCalledTimes(1)
    expect(result.close).toHaveBeenCalledTimes(1)
    expect(value.group.children).toHaveLength(0)
    expect(result.scene.children).toHaveLength(0)
    expect(result.unusedScene.children).toHaveLength(0)
  })

  it.each(['network', 'http', 'decode'] as const)(
    'omits only the aircraft after a %s failure',
    async (failure) => {
      const fetch = spyOn(globalThis, 'fetch')
      if (failure === 'network') fetch.mockRejectedValue(new Error('Offline'))
      else
        fetch.mockResolvedValue(
          new Response(new Uint8Array([1]), { status: failure === 'http' ? 503 : 200 }),
        )
      const parse = spyOn(GLTFLoader.prototype, 'parseAsync').mockRejectedValue(
        new Error('Invalid model'),
      )
      const onChange = mock(() => {})
      const value = start(onChange)
      await settle()

      expect(value.group.children).toHaveLength(0)
      expect(value.group.userData.loadState).toBe('unavailable')
      expect(onChange).not.toHaveBeenCalled()
      expect(parse).toHaveBeenCalledTimes(failure === 'decode' ? 1 : 0)
      expect(() => value.update(12)).not.toThrow()
    },
  )

  it('aborts an outstanding request when the terminal is disposed', async () => {
    let signal: AbortSignal | undefined
    spyOn(globalThis, 'fetch').mockImplementation(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          signal = options?.signal ?? undefined
          signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          )
        }),
    )
    const parse = spyOn(GLTFLoader.prototype, 'parseAsync')
    const onChange = mock(() => {})
    const value = start(onChange)
    value.dispose()
    await settle()

    expect(signal?.aborted).toBe(true)
    expect(parse).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
    expect(value.group.userData.loadState).toBe('disposed')
  })

  it('does not begin decoding if disposal happens while the response body is read', async () => {
    const body = deferred<ArrayBuffer>()
    const response = new Response()
    spyOn(response, 'arrayBuffer').mockReturnValue(body.promise)
    spyOn(globalThis, 'fetch').mockResolvedValue(response)
    const parse = spyOn(GLTFLoader.prototype, 'parseAsync')
    const value = start()
    await settle()
    value.dispose()
    body.resolve(new ArrayBuffer(4))
    await settle()

    expect(parse).not.toHaveBeenCalled()
    expect(value.group.children).toHaveLength(0)
  })

  it('disposes a decoded model that arrives after teardown without attaching or redrawing it', async () => {
    const result = fixture()
    const decoded = deferred<GLTF>()
    requestSucceeds()
    const parse = spyOn(GLTFLoader.prototype, 'parseAsync').mockReturnValue(decoded.promise)
    const onChange = mock(() => {})
    const value = start(onChange)
    await settle()
    expect(parse).toHaveBeenCalledTimes(1)
    value.dispose()
    decoded.resolve(result.gltf)
    await settle()

    expect(value.group.children).toHaveLength(0)
    expect(onChange).not.toHaveBeenCalled()
    expect(result.geometryDispose).toHaveBeenCalledTimes(1)
    expect(result.materialDispose).toHaveBeenCalledTimes(1)
    expect(result.secondMaterialDispose).toHaveBeenCalledTimes(1)
    expect(result.textureDispose).toHaveBeenCalledTimes(1)
    expect(result.close).toHaveBeenCalledTimes(1)
  })
})
