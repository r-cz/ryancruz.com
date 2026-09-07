/** Convert Ryan's supplied FBX into a normalized, texture-independent exterior GLB.
 * Usage: bun scripts/convert-aircraft.ts /path/to/737.fbx /tmp/737-exterior.glb
 * Then: bunx gltfpack -i /tmp/737-exterior.glb -o public/models/southwest-737.glb -cc -vpf
 */
import * as THREE from 'three'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'

const [source, destination] = process.argv.slice(2)
if (!source || !destination) throw new Error('Provide source FBX and destination GLB paths')

// The only referenced bitmaps are missing engine fan decals. Preserve their
// modeled surfaces as dark metal; no browser image loading is needed here.
Object.assign(globalThis, {
  window: { URL },
  document: {
    createElementNS: () => ({
      addEventListener() {},
      removeEventListener() {},
      set src(_url: string) {},
    }),
  },
  FileReader: class {
    result: ArrayBuffer | undefined
    onloadend: (() => void) | undefined
    readAsArrayBuffer(blob: Blob) {
      void blob.arrayBuffer().then((buffer) => {
        this.result = buffer
        this.onloadend?.()
      })
    }
  },
})

const model = new FBXLoader().parse(await Bun.file(source).arrayBuffer(), '')
model.updateMatrixWorld(true)
const bounds = new THREE.Box3().setFromObject(model)
const center = bounds.getCenter(new THREE.Vector3())
const length = bounds.max.z - bounds.min.z
const remove: THREE.Object3D[] = []
const materials = new Map<THREE.Material, THREE.MeshStandardMaterial>()
let triangles = 0
model.traverse((object) => {
  object.userData = {}
  if (object instanceof THREE.Light || object instanceof THREE.Camera) {
    remove.push(object)
    return
  }
  if (!(object instanceof THREE.Mesh)) return
  const originals: THREE.MeshPhongMaterial[] = Array.isArray(object.material)
    ? object.material
    : [object.material]
  // In this source model, all __DEFAULT meshes are the enclosed cabin fittings.
  if (originals.every((material) => material.name === '__DEFAULT')) {
    remove.push(object)
    return
  }
  object.material = originals.map((original) => {
    let surface = materials.get(original)
    if (!surface) {
      const fan = Boolean(original.map)
      const glazing = /Glass/i.test(original.name)
      surface = new THREE.MeshStandardMaterial({
        name: original.name,
        color: fan ? '#26313b' : original.color,
        roughness: glazing ? 0.18 : 0.44,
        metalness: fan ? 0.65 : 0.16,
        side: original.side,
        transparent: !fan && original.transparent,
        opacity: fan ? 1 : original.opacity,
      })
      materials.set(original, surface)
    }
    return surface
  })
  triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3
})
remove.forEach((object) => object.removeFromParent())
model.position.set(-center.x, -bounds.min.y, -center.z)
const normalized = new THREE.Group()
normalized.name = 'Southwest Boeing 737'
normalized.rotation.y = -Math.PI / 2
normalized.scale.setScalar(11 / length)
normalized.add(model)
normalized.updateMatrixWorld(true)
const result = await new GLTFExporter().parseAsync(normalized, { binary: true, onlyVisible: true })
if (!(result instanceof ArrayBuffer)) throw new Error('Expected binary GLB output')
await Bun.write(destination, result)
console.log(
  `Exported ${triangles} exterior triangles; removed ${remove.length} interior/scene objects; ${result.byteLength} bytes`,
)
