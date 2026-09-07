import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

/**
 * Modeled architecture informed by Corgan's DAL modernization photography:
 * https://www.corgan.com/projects/dal-love-field-modernization-program-lfmp
 * Original geometry, with no photographic or generated-image textures.
 */
export function createTerminalEnvironment(): {
  group: THREE.Group
  update(timeSeconds: number): void
  dispose(): void
} {
  const group = new THREE.Group()
  group.name = 'Dallas Love Field terminal'
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()
  const geometry = <T extends THREE.BufferGeometry>(value: T): T => {
    geometries.add(value)
    return value
  }
  const material = (color: number, roughness = 0.75, metalness = 0) => {
    const value = new THREE.MeshStandardMaterial({ color, roughness, metalness })
    materials.add(value)
    return value
  }

  const stone = material(0xd3cfc3, 0.7)
  const tileJoint = material(0xbdb9b0, 0.9)
  const cream = material(0xe5e2d9, 0.65)
  const warmWood = material(0xa57e50, 0.79)
  const lightWood = material(0xb99667, 0.82)
  const woodEdge = material(0x947148, 0.82)
  const aluminum = material(0xadb5b5, 0.3, 0.68)
  const darkMetal = material(0x555c5b, 0.4, 0.65)
  const upholstery = material(0x303b3d, 0.85)
  const rubber = material(0x232a2c, 0.94)
  const concrete = material(0xaeb5b4, 0.95)
  const distantBuilding = material(0xc2c9c8, 0.86)
  const marking = material(0xd3b054, 0.9)
  const blue = material(0x254f9c, 0.39, 0.15)
  const red = material(0xd44339, 0.44)
  const yellow = material(0xf0b541, 0.47)
  const planeWindow = material(0x233947, 0.2, 0.3)
  const ceilingLight = new THREE.MeshStandardMaterial({
    color: 0xfff4df,
    emissive: 0xffe9c2,
    emissiveIntensity: 0.85,
    roughness: 0.55,
  })
  materials.add(ceilingLight)
  const glass = new THREE.MeshStandardMaterial({
    color: 0xb2d2dc,
    transparent: true,
    opacity: 0.095,
    roughness: 0.2,
    metalness: 0.05,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  materials.add(glass)

  const cube = geometry(new THREE.BoxGeometry(1, 1, 1))
  const roundedCube = geometry(new RoundedBoxGeometry(1, 1, 1, 2, 0.09))
  const cylinder = geometry(new THREE.CylinderGeometry(1, 1, 1, 20))
  const sphere = geometry(new THREE.SphereGeometry(1, 20, 12))
  const dummy = new THREE.Object3D()
  const batches = new Map<
    string,
    {
      shape: THREE.BufferGeometry
      surface: THREE.Material
      matrices: THREE.Matrix4[]
      castShadow: boolean
    }
  >()

  function instance(
    shape: THREE.BufferGeometry,
    surface: THREE.Material,
    position: [number, number, number],
    scale: [number, number, number],
    rotation: [number, number, number] = [0, 0, 0],
    castShadow = true,
  ) {
    const key = `${shape.uuid}:${surface.uuid}:${castShadow}`
    let batch = batches.get(key)
    if (!batch) {
      batch = { shape, surface, matrices: [], castShadow }
      batches.set(key, batch)
    }
    dummy.position.set(...position)
    dummy.scale.set(...scale)
    dummy.rotation.set(...rotation)
    dummy.updateMatrix()
    batch.matrices.push(dummy.matrix.clone())
  }

  const box = (
    surface: THREE.Material,
    position: [number, number, number],
    size: [number, number, number],
    castShadow = true,
  ) => instance(cube, surface, position, size, [0, 0, 0], castShadow)

  // An open foreground keeps the camera move into the laptop unobstructed.
  box(stone, [2, -0.07, -7], [18, 0.14, 24], false)
  for (let z = -17; z <= 3; z += 2) box(tileJoint, [2, 0.002, z], [18, 0.004, 0.013], false)
  for (let x = -5; x <= 11; x += 2) box(tileJoint, [x, 0.003, -7], [0.013, 0.004, 24], false)
  // Small inset bands recall the terrazzo pattern without a tiled image texture.
  box(material(0xc2baab, 0.8), [2, 0.006, -3.7], [18, 0.006, 0.23], false)
  box(material(0xc2baab, 0.8), [2, 0.006, -12.4], [18, 0.006, 0.23], false)

  // Exposed glulam beams and a warm wood ceiling are DAL's defining structure.
  box(lightWood, [1.9, 6.05, -7.4], [18.3, 0.16, 24.5], false)
  for (let z = -17.5; z <= 3.5; z += 2.45) {
    box(warmWood, [1.9, 5.73, z], [18.3, 0.54, 0.28])
    box(woodEdge, [1.9, 5.46, z], [18.3, 0.018, 0.3])
    box(lightWood, [1.9, 5.67, z + 0.145], [18.3, 0.026, 0.014])
    for (const y of [5.54, 5.63, 5.81, 5.9]) {
      box(woodEdge, [1.9, y, z + 0.145], [18.3, 0.007, 0.01], false)
    }
  }
  for (let x = -6.8; x <= 10.8; x += 0.58) {
    box(woodEdge, [x, 5.962, -7.4], [0.012, 0.012, 24.5], false)
  }
  for (const z of [-13.8, -8.9, -4, 0.9]) {
    for (const x of [-2.7, 4.2]) {
      box(aluminum, [x, 5.935, z], [3.5, 0.05, 0.12], false)
      box(ceilingLight, [x, 5.906, z], [3.36, 0.013, 0.068], false)
    }
  }
  for (const x of [-5.7, 7.65]) {
    for (const z of [-15.5, -8, -0.4]) {
      instance(cylinder, cream, [x, 2.85, z], [0.3, 5.7, 0.3])
      instance(cylinder, aluminum, [x, 0.09, z], [0.313, 0.18, 0.313])
      box(aluminum, [x, 5.54, z], [0.68, 0.12, 0.7])
    }
  }

  // Clear gridded curtain walls on the left and back expose the live apron.
  box(cream, [-7.08, 0.2, -7.4], [0.24, 0.4, 22.2])
  box(cream, [1.9, 0.2, -18.1], [18.3, 0.4, 0.24])
  const pane = geometry(new THREE.PlaneGeometry(1, 1))
  instance(pane, glass, [-7, 3.03, -7.5], [21.2, 5.26, 1], [0, Math.PI / 2, 0], false)
  instance(pane, glass, [1.95, 3.03, -18], [18.1, 5.26, 1], [0, 0, 0], false)
  for (let z = -18; z <= 3.2; z += 2.65) box(aluminum, [-6.97, 3.02, z], [0.095, 5.65, 0.09])
  for (let x = -7; x <= 11.1; x += 2.6) box(aluminum, [x, 3.02, -17.97], [0.09, 5.65, 0.095])
  for (const y of [0.43, 2.2, 4.28, 5.83]) {
    box(aluminum, [-6.965, y, -7.5], [0.1, 0.065, 21.2])
    box(aluminum, [2, y, -17.965], [18.2, 0.065, 0.1])
  }

  // Linked gate chairs: rounded charcoal cushions on shared metal rails.
  const addSeatRow = (startX: number, z: number, count: number, facing = 1) => {
    const span = count * 0.82
    box(darkMetal, [startX + (span - 0.82) / 2, 0.34, z], [span - 0.2, 0.095, 0.12])
    for (const x of [startX + 0.35, startX + span - 1.17]) {
      instance(cylinder, aluminum, [x, 0.2, z], [0.036, 0.35, 0.036])
      instance(roundedCube, aluminum, [x, 0.06, z], [0.14, 0.085, 0.76])
    }
    for (let index = 0; index < count; index += 1) {
      const x = startX + index * 0.82
      instance(roundedCube, upholstery, [x, 0.48, z + facing * 0.09], [0.7, 0.115, 0.66])
      instance(
        roundedCube,
        upholstery,
        [x, 0.88, z - facing * 0.22],
        [0.7, 0.71, 0.11],
        [-facing * 0.14, 0, 0],
      )
      for (const offset of [-0.375, 0.375]) {
        instance(roundedCube, aluminum, [x + offset, 0.65, z + facing * 0.08], [0.045, 0.04, 0.54])
        instance(cylinder, aluminum, [x + offset, 0.51, z - 0.1], [0.017, 0.25, 0.017])
      }
    }
  }
  addSeatRow(2.65, -4.4, 6)
  addSeatRow(2.65, -5.65, 6, -1)
  addSeatRow(2.65, -9.1, 6)
  addSeatRow(2.65, -10.35, 6, -1)
  addSeatRow(-5.7, -12.6, 5)
  addSeatRow(-5.7, -13.85, 5, -1)
  // A quieter left-hand row preserves a visible aisle beyond the laptop.
  addSeatRow(-5.75, -5.9, 3)

  // Broad daylight apron and distant low buildings beyond the glass.
  box(concrete, [-3, -0.19, -30], [120, 0.12, 110], false)
  box(material(0x919fa0, 0.98), [0, -0.12, -41], [110, 0.018, 11], false)
  for (let x = -40; x < 40; x += 8) {
    box(marking, [x, -0.105, -23.1], [4.8, 0.014, 0.06], false)
    box(cream, [x, -0.1, -40], [3.6, 0.015, 0.17], false)
  }
  for (let x = -40; x <= 38; x += 8.2) {
    box(distantBuilding, [x, 0.85, -55], [7.7, 1.85, 7], false)
    box(aluminum, [x, 1.85, -55], [7.85, 0.12, 7.2], false)
  }

  // Physical signs use crisp canvas text independent of the scene's daylight exposure.
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 270
  const context = canvas.getContext('2d')
  if (context) {
    context.fillStyle = '#172f43'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#f5f1e5'
    context.font = '600 110px system-ui, sans-serif'
    context.fillText('DAL', 40, 162)
    context.font = '42px system-ui, sans-serif'
    context.fillText('Dallas Love Field', 312, 153)
    context.fillStyle = '#bd9b66'
    context.fillRect(42, 210, 940, 3)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    textures.add(texture)
    const signMaterial = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
    materials.add(signMaterial)
    const sign = new THREE.Mesh(geometry(new THREE.PlaneGeometry(3.8, 1)), signMaterial)
    sign.name = 'DAL terminal sign'
    sign.position.set(-3.5, 3.5, -12.5)
    group.add(sign)
    box(darkMetal, [-3.5, 3.5, -12.57], [3.9, 1.1, 0.12])
    for (const x of [-4.95, -2.05]) {
      instance(cylinder, aluminum, [x, 4.81, -12.57], [0.018, 1.56, 0.018])
    }
  }

  const gateCanvas = document.createElement('canvas')
  gateCanvas.width = 256
  gateCanvas.height = 320
  const gateContext = gateCanvas.getContext('2d')
  if (gateContext) {
    gateContext.fillStyle = '#172f43'
    gateContext.fillRect(0, 0, gateCanvas.width, gateCanvas.height)
    gateContext.fillStyle = '#f5f1e5'
    gateContext.textAlign = 'center'
    gateContext.font = '500 34px system-ui, sans-serif'
    gateContext.fillText('GATE', 128, 64)
    gateContext.font = '500 200px system-ui, sans-serif'
    gateContext.fillText('8', 128, 262)
    const gateTexture = new THREE.CanvasTexture(gateCanvas)
    gateTexture.colorSpace = THREE.SRGBColorSpace
    textures.add(gateTexture)
    const gateMaterial = new THREE.MeshBasicMaterial({ map: gateTexture, toneMapped: false })
    materials.add(gateMaterial)
    const gateSign = new THREE.Mesh(geometry(new THREE.PlaneGeometry(0.7, 0.875)), gateMaterial)
    gateSign.name = 'Gate 8 column sign'
    // The nearest visible right column; the foreground column is outside the camera frame.
    gateSign.position.set(7.46, 3.3, -7.63)
    gateSign.rotation.y = -0.48
    group.add(gateSign)
    instance(cube, darkMetal, [7.48, 3.3, -7.67], [0.76, 0.935, 0.065], [0, -0.48, 0])
  }

  for (const { shape, surface, matrices, castShadow } of batches.values()) {
    const mesh = new THREE.InstancedMesh(shape, surface, matrices.length)
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix))
    mesh.castShadow = castShadow
    mesh.receiveShadow = true
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
    group.add(mesh)
  }

  const aircraft = new THREE.Group()
  aircraft.name = 'Taxiing Southwest-inspired aircraft'
  aircraft.position.set(-3.5, 0, -24.4)
  group.add(aircraft)
  const part = (
    shape: THREE.BufferGeometry,
    surface: THREE.Material,
    position: [number, number, number],
    scale: [number, number, number] = [1, 1, 1],
    rotation: [number, number, number] = [0, 0, 0],
  ) => {
    const mesh = new THREE.Mesh(shape, surface)
    mesh.position.set(...position)
    mesh.scale.set(...scale)
    mesh.rotation.set(...rotation)
    mesh.castShadow = true
    mesh.receiveShadow = true
    aircraft.add(mesh)
    return mesh
  }
  // Fuselage runs along X, with the nose facing left and the tail on the right.
  part(cylinder, blue, [0, 1.02, 0], [0.52, 8.1, 0.52], [0, 0, Math.PI / 2])
  part(sphere, blue, [-4.08, 1.02, 0], [0.94, 0.515, 0.515])
  part(sphere, blue, [3.86, 1.03, 0], [1.34, 0.42, 0.42])
  part(sphere, red, [0, 0.72, 0], [4.23, 0.235, 0.43])
  for (const side of [-1, 1]) {
    part(sphere, planeWindow, [-4.32, 1.25, side * 0.37], [0.42, 0.135, 0.17])
    for (let x = -3.2; x < 3.5; x += 0.31) {
      part(sphere, planeWindow, [x, 1.22, side * 0.474], [0.071, 0.095, 0.016])
    }
  }

  function polygon(points: [number, number][], depth: number) {
    const shape = new THREE.Shape()
    points.forEach(([x, y], index) => (index === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)))
    shape.closePath()
    return geometry(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, steps: 1 }))
  }
  const fin = polygon(
    [
      [2.8, 1.25],
      [4.55, 1.2],
      [4.2, 3.25],
      [3.55, 3.25],
    ],
    0.1,
  )
  part(fin, blue, [0, 0, -0.05])
  // Geometric red and golden bands follow the distinctive Southwest tail palette.
  const redBand = polygon(
    [
      [2.94, 1.48],
      [4.52, 1.46],
      [4.4, 2.13],
      [3.27, 2.08],
    ],
    0.114,
  )
  const goldBand = polygon(
    [
      [3.29, 2.1],
      [4.4, 2.15],
      [4.31, 2.68],
      [3.45, 2.66],
    ],
    0.116,
  )
  part(redBand, red, [0, 0, -0.057])
  part(goldBand, yellow, [0, 0, -0.058])
  for (const side of [-1, 1]) {
    const wing = polygon(
      [
        [-0.95, 0.1],
        [1.1, 0.1],
        [2.45, side * 3.75],
        [1.8, side * 3.9],
      ],
      0.07,
    )
    part(wing, aluminum, [0, 0.83, 0], [1, 1, 1], [-Math.PI / 2, 0, 0])
    const stabilizer = polygon(
      [
        [3.35, 0],
        [4.48, 0],
        [4.8, side * 1.73],
        [4.24, side * 1.86],
      ],
      0.055,
    )
    part(stabilizer, blue, [0, 1.05, 0], [1, 1, 1], [-Math.PI / 2, 0, 0])
    part(cylinder, blue, [-0.25, 0.52, side * 1.02], [0.31, 1.04, 0.31], [0, 0, Math.PI / 2])
    part(cylinder, rubber, [-0.785, 0.52, side * 1.02], [0.24, 0.012, 0.24], [0, 0, Math.PI / 2])
    part(cylinder, rubber, [1.05, 0.13, side * 0.47], [0.17, 0.13, 0.17], [Math.PI / 2, 0, 0])
  }
  part(cylinder, rubber, [-3.4, 0.11, 0], [0.135, 0.15, 0.135], [Math.PI / 2, 0, 0])

  return {
    group,
    update(timeSeconds) {
      // A long, even taxi: the wrap occurs completely outside both window walls.
      aircraft.position.x = 19 - ((timeSeconds * 0.24 + 22.5) % 52)
    },
    dispose() {
      group.traverse((object) => {
        if (object instanceof THREE.InstancedMesh) object.dispose()
      })
      textures.forEach((value) => value.dispose())
      geometries.forEach((value) => value.dispose())
      materials.forEach((value) => value.dispose())
      group.clear()
    },
  }
}
