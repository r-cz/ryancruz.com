import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { createAircraft } from './aircraft'
import { apronLevel, boardingDoorOpening, createBoardingGate } from './boarding-gate'

/**
 * Modeled architecture informed by Corgan's DAL modernization photography:
 * https://www.corgan.com/projects/dal-love-field-modernization-program-lfmp
 * Original geometry, with no photographic or generated-image textures.
 */
export function createTerminalEnvironment(onChange: () => void = () => {}): {
  group: THREE.Group
  update(timeSeconds: number): void
  setDaylight(daylight: number): void
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
  const concrete = material(0xaeb5b4, 0.95)
  const distantBuilding = material(0xc2c9c8, 0.86)
  const marking = material(0xd3b054, 0.9)
  const ceilingLight = new THREE.MeshStandardMaterial({
    color: 0xfff4df,
    emissive: 0xffe9c2,
    emissiveIntensity: 0.85,
    roughness: 0.55,
  })
  materials.add(ceilingLight)
  const taxiLight = new THREE.MeshStandardMaterial({
    color: 0x83bcff,
    emissive: 0x327de8,
    emissiveIntensity: 0.15,
  })
  materials.add(taxiLight)
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
  let assemblyTransform: THREE.Matrix4 | undefined
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
    const matrix = dummy.matrix.clone()
    if (assemblyTransform) matrix.premultiply(assemblyTransform)
    batch.matrices.push(matrix)
  }

  const box = (
    surface: THREE.Material,
    position: [number, number, number],
    size: [number, number, number],
    castShadow = true,
  ) => instance(cube, surface, position, size, [0, 0, 0], castShadow)

  // Continue the concourse beyond the right edge of wide desktop views.
  const terminalLeft = -7
  const terminalRight = 37.2
  const terminalWidth = terminalRight - terminalLeft
  const terminalCenter = (terminalLeft + terminalRight) / 2
  // An open foreground keeps the camera move into the laptop unobstructed.
  box(stone, [terminalCenter, -0.07, -7], [terminalWidth, 0.14, 24], false)
  for (let z = -17; z <= 3; z += 2)
    box(tileJoint, [terminalCenter, 0.002, z], [terminalWidth, 0.004, 0.013], false)
  for (let x = -5; x <= terminalRight; x += 2)
    box(tileJoint, [x, 0.003, -7], [0.013, 0.004, 24], false)
  // Small inset bands recall the terrazzo pattern without a tiled image texture.
  box(material(0xc2baab, 0.8), [terminalCenter, 0.006, -3.7], [terminalWidth, 0.006, 0.23], false)
  box(material(0xc2baab, 0.8), [terminalCenter, 0.006, -12.4], [terminalWidth, 0.006, 0.23], false)

  // Exposed glulam beams and a warm wood ceiling are DAL's defining structure.
  box(lightWood, [terminalCenter, 6.05, -7.4], [terminalWidth + 0.3, 0.16, 24.5], false)
  for (let z = -17.5; z <= 3.5; z += 2.45) {
    box(warmWood, [terminalCenter, 5.73, z], [terminalWidth + 0.3, 0.54, 0.28])
    box(woodEdge, [terminalCenter, 5.46, z], [terminalWidth + 0.3, 0.018, 0.3])
    box(lightWood, [terminalCenter, 5.67, z + 0.145], [terminalWidth + 0.3, 0.026, 0.014])
    for (const y of [5.54, 5.63, 5.81, 5.9]) {
      box(woodEdge, [terminalCenter, y, z + 0.145], [terminalWidth + 0.3, 0.007, 0.01], false)
    }
  }
  for (let x = -6.8; x <= terminalRight; x += 0.58) {
    box(woodEdge, [x, 5.962, -7.4], [0.012, 0.012, 24.5], false)
  }
  for (const z of [-13.8, -8.9, -4, 0.9]) {
    for (let x = -2.7; x < terminalRight - 2; x += 6.9) {
      box(aluminum, [x, 5.935, z], [3.5, 0.05, 0.12], false)
      box(ceilingLight, [x, 5.906, z], [3.36, 0.013, 0.068], false)
    }
  }
  for (const x of [-5.7, 7.65, 21, 34.35]) {
    for (const z of [-15.5, -8, -0.4]) {
      instance(cylinder, cream, [x, 2.85, z], [0.3, 5.7, 0.3])
      instance(cylinder, aluminum, [x, 0.09, z], [0.313, 0.18, 0.313])
      box(aluminum, [x, 5.54, z], [0.68, 0.12, 0.7])
    }
  }

  // Clear gridded curtain walls on the left and back expose the live apron.
  const doorBack = boardingDoorOpening.z - boardingDoorOpening.width / 2
  const doorFront = boardingDoorOpening.z + boardingDoorOpening.width / 2
  // Keep the boarding doorway clear through the sill, glazing and window grid.
  for (const [back, front] of [
    [-18.5, doorBack],
    [doorFront, 3.7],
  ]) {
    box(cream, [-7.08, 0.2, (back + front) / 2], [0.24, 0.4, front - back])
  }
  box(cream, [terminalCenter, 0.2, -18.1], [terminalWidth + 0.3, 0.4, 0.24])
  const pane = geometry(new THREE.PlaneGeometry(1, 1))
  for (const [back, front] of [
    [-18.1, doorBack],
    [doorFront, 3.1],
  ]) {
    instance(
      pane,
      glass,
      [-7, 3.03, (back + front) / 2],
      [front - back, 5.26, 1],
      [0, Math.PI / 2, 0],
      false,
    )
  }
  instance(
    pane,
    glass,
    [-7, (5.66 + boardingDoorOpening.height) / 2, boardingDoorOpening.z],
    [boardingDoorOpening.width, 5.66 - boardingDoorOpening.height, 1],
    [0, Math.PI / 2, 0],
    false,
  )
  instance(pane, glass, [terminalCenter, 3.03, -18], [terminalWidth, 5.26, 1], [0, 0, 0], false)
  for (let z = -18; z <= 3.2; z += 2.65) {
    if (z > doorBack && z < doorFront) {
      box(
        aluminum,
        [-6.97, (5.845 + boardingDoorOpening.height) / 2, z],
        [0.095, 5.845 - boardingDoorOpening.height, 0.09],
      )
    } else {
      box(aluminum, [-6.97, 3.02, z], [0.095, 5.65, 0.09])
    }
  }
  for (let x = terminalLeft; x <= terminalRight + 0.01; x += 2.6)
    box(aluminum, [x, 3.02, -17.97], [0.09, 5.65, 0.095])
  for (const y of [0.43, 2.2, 4.28, 5.83]) {
    if (y < boardingDoorOpening.height) {
      for (const [back, front] of [
        [-18.1, doorBack],
        [doorFront, 3.1],
      ]) {
        box(aluminum, [-6.965, y, (back + front) / 2], [0.1, 0.065, front - back])
      }
    } else {
      box(aluminum, [-6.965, y, -7.5], [0.1, 0.065, 21.2])
    }
    box(aluminum, [terminalCenter, y, -17.965], [terminalWidth + 0.1, 0.065, 0.1])
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
  // Turn each seating bank a quarter turn around its center, keeping its aisle
  // and paired back-to-back rows. Bake the transform into the existing instances.
  const addSeatingBank = (
    centerX: number,
    centerZ: number,
    rows: [startX: number, z: number, count: number, facing?: number][],
  ) => {
    assemblyTransform = new THREE.Matrix4()
      .makeTranslation(centerX, 0, centerZ)
      .multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2))
      .multiply(new THREE.Matrix4().makeTranslation(-centerX, 0, -centerZ))
    rows.forEach(([x, z, count, facing]) => addSeatRow(x, z, count, facing))
    assemblyTransform = undefined
  }
  addSeatingBank(4.7, -5.025, [
    [2.65, -4.4, 6],
    [2.65, -5.65, 6, -1],
  ])
  addSeatingBank(4.7, -10.725, [
    [2.65, -10.1, 6],
    [2.65, -11.35, 6, -1],
  ])
  addSeatingBank(-4.23, -12.35, [
    [-5.87, -11.725, 5],
    [-5.87, -12.975, 5, -1],
  ])
  addSeatingBank(-4.93, -5.9, [
    [-5.75, -5.275, 3],
    [-5.75, -6.525, 3, -1],
  ])

  // Broad daylight apron and distant low buildings beyond the glass.
  // The concourse sits above the apron, allowing a descending boarding ramp.
  assemblyTransform = new THREE.Matrix4().makeTranslation(0, apronLevel + 0.13, 0)
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

  for (let x = -44; x <= 44; x += 5.5) {
    for (const z of [-27, -46]) {
      instance(sphere, taxiLight, [x, 0.015, z], [0.055, 0.04, 0.055], [0, 0, 0], false)
    }
  }
  assemblyTransform = undefined

  // Column-mounted portrait displays, based on the visitor-supplied DAL photo.
  // These are simulated gate details, drawn into backlit screen textures.
  const gateDisplays: {
    context: CanvasRenderingContext2D
    texture: THREE.CanvasTexture
    number: string
    destination: string
    airport: string
    flight: string
    boarding: string
  }[] = []
  const drawGate = (display: (typeof gateDisplays)[number], boarding: boolean) => {
    const { context: ctx, number, destination, airport, flight } = display
    ctx.fillStyle = '#f3f4ff'
    ctx.fillRect(0, 0, 512, 960)
    ctx.fillStyle = '#2645cf'
    ctx.fillRect(0, 0, 512, 432)
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.font = '600 300px system-ui, sans-serif'
    ctx.fillText(number, 256, 318)
    ctx.textAlign = 'left'
    ctx.font = '600 24px system-ui, sans-serif'
    ctx.fillText(`Board: ${display.boarding}`, 34, 394)
    ctx.fillStyle = '#34394b'
    ctx.font = '22px system-ui, sans-serif'
    ctx.fillText(`Flight ${flight} · Southwest`, 34, 484)
    ctx.font = '500 47px system-ui, sans-serif'
    ctx.fillText(destination, 34, 553, 444)
    ctx.font = '23px system-ui, sans-serif'
    ctx.fillText(`${airport} · Nonstop`, 34, 599)
    ctx.fillStyle = '#dde1f1'
    ctx.fillRect(0, 658, 512, 160)
    ctx.fillStyle = '#293f99'
    ctx.font = '600 28px system-ui, sans-serif'
    ctx.fillText(boarding ? 'Now boarding' : 'On time', 34, 710)
    ctx.fillStyle = '#535c72'
    ctx.font = '21px system-ui, sans-serif'
    ctx.fillText(boarding ? 'Welcome aboard.' : 'Your next stop awaits.', 34, 757)
    ctx.fillStyle = '#263faf'
    ctx.font = '600 25px system-ui, sans-serif'
    ctx.fillText('Southwest', 34, 869)
    ctx.fillStyle = '#737a91'
    ctx.font = '17px system-ui, sans-serif'
    ctx.fillText('SIMULATED FLIGHT INFORMATION', 34, 922)
    display.texture.needsUpdate = true
  }
  function addGate(
    number: string,
    destination: string,
    airport: string,
    flight: string,
    boarding: string,
    x: number,
    z: number,
    angle: number,
  ) {
    const gateCanvas = document.createElement('canvas')
    gateCanvas.width = 512
    gateCanvas.height = 960
    const gateContext = gateCanvas.getContext('2d')
    if (!gateContext) return
    const texture = new THREE.CanvasTexture(gateCanvas)
    texture.colorSpace = THREE.SRGBColorSpace
    textures.add(texture)
    const faceMaterial = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
    materials.add(faceMaterial)
    const mount = new THREE.Group()
    mount.name = `Gate ${number} digital display`
    mount.position.set(x, 3.5, z)
    mount.rotation.y = angle
    const housing = new THREE.Mesh(geometry(new THREE.BoxGeometry(1.13, 2.09, 0.15)), aluminum)
    const bezel = new THREE.Mesh(geometry(new THREE.BoxGeometry(1.045, 1.99, 0.035)), darkMetal)
    bezel.position.z = 0.086
    const face = new THREE.Mesh(geometry(new THREE.PlaneGeometry(1, 1.875)), faceMaterial)
    face.position.z = 0.108
    mount.add(housing, bezel, face)
    group.add(mount)
    const display = {
      context: gateContext,
      texture,
      number,
      destination,
      airport,
      flight,
      boarding,
    }
    gateDisplays.push(display)
    drawGate(display, false)
  }
  addGate('18', 'Atlanta, GA', 'ATL', '2146', '2:35 PM', 7.4, -7.62, -0.35)
  addGate('20', 'Philadelphia, PA', 'PHL', '1158', '2:20 PM', -5.48, -7.61, 0.25)
  let gatePhase = 0

  for (const { shape, surface, matrices, castShadow } of batches.values()) {
    const mesh = new THREE.InstancedMesh(shape, surface, matrices.length)
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix))
    mesh.castShadow = castShadow
    mesh.receiveShadow = true
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
    group.add(mesh)
  }

  const boardingGate = createBoardingGate()
  group.add(boardingGate.group)

  const aircraft = createAircraft(onChange)
  // Place the taxi lane farther out so the raised concourse still sees the plane
  // above the seating, retaining its apparent size and speed from the laptop.
  aircraft.group.position.set(-0.7, apronLevel, -32)
  aircraft.group.rotation.y = Math.PI
  aircraft.group.scale.setScalar(1.25)
  group.add(aircraft.group)

  return {
    group,
    setDaylight(daylight) {
      ceilingLight.emissiveIntensity = 0.85 + (1 - daylight) * 1.15
      taxiLight.emissiveIntensity = 0.15 + (1 - daylight) * 3
    },
    update(timeSeconds) {
      const nextPhase = Math.floor(timeSeconds / 18)
      if (nextPhase !== gatePhase) {
        gatePhase = nextPhase
        gateDisplays.forEach((display, index) => drawGate(display, (nextPhase + index) % 3 === 1))
      }
      // A long, even taxi: the wrap occurs completely outside both window walls.
      aircraft.group.position.x = -80 + ((timeSeconds * 0.3 + 79.3) % 160)
      aircraft.update(timeSeconds)
    },
    dispose() {
      aircraft.dispose()
      boardingGate.dispose()
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
