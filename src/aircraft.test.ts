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

function requestSucceeds() {
  return spyOn(globalThis, 'fetch').mockResolvedValue(new Response(new Uint8Array([1, 2, 3])))
}

afterEach(async () => {
  aircraft.splice(0).forEach((value) => value.dispose())
  await settle()
  mock.restore()
})

describe('downloaded aircraft lifecycle', () => {
  it('decodes the shipped Meshopt asset at terminal scale', async () => {
    const bytes = await Bun.file(
      new URL('../public/models/southwest-737.glb', import.meta.url),
    ).arrayBuffer()
    spyOn(globalThis, 'fetch').mockResolvedValue(new Response(bytes))
    const ready = deferred<void>()
    const value = start(() => ready.resolve())
    await ready.promise
    const bounds = new THREE.Box3().setFromObject(value.group)
    const size = bounds.getSize(new THREE.Vector3())
    let triangles = 0
    value.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3
    })
    // Allow the small bounds changes introduced by geometry simplification.
    expect(size.x).toBeGreaterThan(10.7)
    expect(size.x).toBeLessThan(11.3)
    expect(size.y).toBeGreaterThan(3.4)
    expect(size.y).toBeLessThan(3.7)
    expect(size.z).toBeGreaterThan(9.8)
    expect(size.z).toBeLessThan(10.2)
    expect(Math.abs(bounds.min.y)).toBeLessThan(0.02)
    expect(triangles).toBeGreaterThan(10000)
    expect(triangles).toBeLessThan(80000)
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
    expect(fetch.mock.calls[0]?.[0]).toBe('/models/southwest-737.glb')
    expect(fetch.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal)
    expect(decoder).toHaveBeenCalledWith(MeshoptDecoder)
    expect(parse).toHaveBeenCalledTimes(1)
    expect(parse.mock.calls[0]?.[1]).toBe('/models/')
    expect(value.group.children).toEqual([result.scene])
    expect(result.mesh.castShadow).toBe(true)
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
