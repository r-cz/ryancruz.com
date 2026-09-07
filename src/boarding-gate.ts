import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

type Point = [number, number, number]

export const boardingDoorOpening = { z: -15.3, width: 1.48, height: 2.83 }
// The concourse sits above the apron; the bridge descends toward the aircraft.
export const apronLevel = -1.1

/** Small boarding station and an enclosed jetbridge at the terminal's far-left end. */
export function createBoardingGate(): { group: THREE.Group; dispose(): void } {
  const group = new THREE.Group()
  group.name = 'Gate 20 boarding area'
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()
  const instances: THREE.InstancedMesh[] = []
  let disposed = false
  const geometry = <T extends THREE.BufferGeometry>(value: T) => {
    geometries.add(value)
    return value
  }
  const material = (color: string, roughness = 0.65, metalness = 0.05) => {
    const value = new THREE.MeshStandardMaterial({ color, roughness, metalness })
    materials.add(value)
    return value
  }
  const metal = material('#9ea8ac', 0.38, 0.65)
  const doorMetal = material('#bcc3c1', 0.55, 0.32)
  const bridgeCladding = material('#bfc5c3', 0.77, 0.18)
  const bridgeRib = material('#a8b0ae', 0.56, 0.35)
  const roof = material('#cbd0cd', 0.74, 0.2)
  const navy = material('#223b5b', 0.63)
  const charcoal = material('#2d353b', 0.5, 0.18)
  const rubber = material('#262b2c', 0.93)
  const pleat = material('#3a4142', 0.86)
  const paper = material('#dcdcd0', 0.96)
  const amber = material('#b38c3e', 0.48)
  const glass = new THREE.MeshStandardMaterial({
    color: '#6e939f',
    transparent: true,
    opacity: 0.46,
    roughness: 0.22,
    metalness: 0.18,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  materials.add(glass)
  const readerLight = new THREE.MeshStandardMaterial({
    color: '#658f84',
    emissive: '#466e65',
    emissiveIntensity: 0.25,
    roughness: 0.6,
  })
  materials.add(readerLight)
  const cube = geometry(new THREE.BoxGeometry(1, 1, 1))
  const rounded = geometry(new RoundedBoxGeometry(1, 1, 1, 1, 0.07))
  const cylinder = geometry(new THREE.CylinderGeometry(1, 1, 1, 20))
  const plane = geometry(new THREE.PlaneGeometry(1, 1))
  const transform = new THREE.Object3D()
  const batches = new Map<
    string,
    {
      parent: THREE.Group
      shape: THREE.BufferGeometry
      surface: THREE.Material
      matrices: THREE.Matrix4[]
    }
  >()

  function part(
    parent: THREE.Group,
    shape: THREE.BufferGeometry,
    surface: THREE.Material,
    position: Point,
    size: Point,
    rotation: Point = [0, 0, 0],
    assembly?: THREE.Matrix4,
  ) {
    transform.position.set(...position)
    transform.scale.set(...size)
    transform.rotation.set(...rotation)
    transform.updateMatrix()
    const matrix = transform.matrix.clone()
    if (assembly) matrix.premultiply(assembly)
    const key = `${parent.uuid}:${shape.uuid}:${surface.uuid}`
    const batch = batches.get(key) ?? { parent, shape, surface, matrices: [] }
    batch.matrices.push(matrix)
    batches.set(key, batch)
  }
  const box = (
    parent: THREE.Group,
    surface: THREE.Material,
    position: Point,
    size: Point,
    assembly?: THREE.Matrix4,
  ) => part(parent, cube, surface, position, size, [0, 0, 0], assembly)

  function display(
    width: number,
    height: number,
    draw: (context: CanvasRenderingContext2D) => void,
    glow = 0,
  ) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    const surface = material('#263e59', 0.56)
    if (context) {
      draw(context)
      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      textures.add(texture)
      surface.color.set('#ffffff')
      surface.map = texture
      if (glow) {
        surface.emissive.set('#ffffff')
        surface.emissiveMap = texture
        surface.emissiveIntensity = glow
      }
    }
    return surface
  }

  const door = new THREE.Group()
  door.name = 'Gate 20 boarding door'
  door.position.set(-6.94, 0, boardingDoorOpening.z)
  door.rotation.y = Math.PI / 2
  group.add(door)
  // A real opening in the leaf leaves the narrow vision panel transparent.
  box(door, charcoal, [0, 0.025, 0], [1.26, 0.05, 0.24])
  for (const x of [-0.59, 0.59]) box(door, metal, [x, 1.23, 0], [0.12, 2.46, 0.18])
  box(door, metal, [0, 2.4, 0], [1.28, 0.12, 0.18])
  box(door, doorMetal, [0, 2.64, -0.025], [1.28, 0.38, 0.13])
  box(door, doorMetal, [0, 0.6, 0.005], [1.05, 1.1, 0.065])
  box(door, doorMetal, [0, 2.1, 0.005], [1.05, 0.44, 0.065])
  for (const x of [-0.38, 0.38]) box(door, doorMetal, [x, 1.515, 0.005], [0.29, 0.73, 0.065])
  for (const x of [-0.235, 0.235]) box(door, charcoal, [x, 1.515, 0.04], [0.027, 0.76, 0.018])
  for (const y of [1.135, 1.895]) box(door, charcoal, [0, y, 0.04], [0.497, 0.027, 0.018])
  part(door, plane, glass, [0, 1.515, 0.018], [0.445, 0.72, 1])
  box(door, metal, [0, 1.055, 0.115], [0.77, 0.045, 0.055])
  for (const x of [-0.365, 0.365]) box(door, charcoal, [x, 1.055, 0.075], [0.048, 0.083, 0.095])
  for (const y of [0.34, 1.18, 2.06])
    part(door, cylinder, metal, [-0.535, y, 0.045], [0.017, 0.095, 0.017])
  box(door, charcoal, [0.695, 1.27, 0.05], [0.085, 0.145, 0.06])
  box(door, readerLight, [0.695, 1.3, 0.082], [0.035, 0.012, 0.008])
  const gateLabel = display(
    512,
    160,
    (context) => {
      context.fillStyle = '#1d3558'
      context.fillRect(0, 0, 512, 160)
      context.fillStyle = '#e9eceb'
      context.font = '600 89px Arial, sans-serif'
      context.fillText('20', 28, 116)
      context.font = '500 25px Arial, sans-serif'
      context.fillText('BOARDING', 182, 86)
    },
    0.08,
  )
  part(door, plane, gateLabel, [0, 2.63, 0.045], [0.96, 0.3, 1])

  const podium = new THREE.Group()
  podium.name = 'Gate 20 Operations podium'
  podium.position.set(-6.4, 0, -14)
  group.add(podium)
  part(podium, rounded, navy, [0, 0.5, 0], [0.86, 0.96, 0.62])
  box(podium, charcoal, [0, 0.067, 0.032], [0.8, 0.11, 0.6])
  box(podium, metal, [0, 0.09, 0.347], [0.78, 0.075, 0.012])
  part(podium, rounded, charcoal, [0, 1.012, 0.015], [1.0, 0.07, 0.78])
  box(podium, metal, [0, 0.9, 0.315], [0.79, 0.015, 0.016])
  box(podium, charcoal, [0.08, 0.78, 0.317], [0.47, 0.024, 0.012])
  const podiumLabel = display(384, 112, (context) => {
    context.fillStyle = '#223b5b'
    context.fillRect(0, 0, 384, 112)
    context.fillStyle = '#e4e7e5'
    context.font = '600 33px Arial, sans-serif'
    context.fillText('Southwest', 24, 53)
    context.fillStyle = '#b3c0cc'
    context.font = '500 18px Arial, sans-serif'
    context.fillText('Operations', 24, 87)
  })
  part(podium, plane, podiumLabel, [0, 0.62, 0.316], [0.66, 0.193, 1])
  // The agent works behind the podium, so the monitor's screen faces the door.
  box(podium, charcoal, [-0.13, 1.055, -0.17], [0.27, 0.025, 0.18])
  box(podium, metal, [-0.13, 1.18, -0.18], [0.026, 0.23, 0.033])
  part(podium, rounded, charcoal, [-0.13, 1.36, -0.16], [0.49, 0.32, 0.048], [-0.08, -0.12, 0])
  const monitor = display(
    384,
    240,
    (context) => {
      context.fillStyle = '#182937'
      context.fillRect(0, 0, 384, 240)
      context.fillStyle = '#334e68'
      context.fillRect(0, 0, 384, 38)
      context.fillStyle = '#a4bec6'
      context.font = '600 17px Arial, sans-serif'
      context.fillText('GATE 20', 17, 25)
      for (let row = 0; row < 5; row++) {
        context.fillStyle = row === 1 ? '#557a78' : '#466075'
        context.fillRect(17, 59 + row * 29, 148 + row * 12, 7)
        context.fillStyle = '#334b5d'
        context.fillRect(264, 59 + row * 29, 94, 7)
      }
    },
    0.12,
  )
  part(podium, plane, monitor, [-0.13, 1.36, -0.187], [0.445, 0.277, 1], [0.08, Math.PI - 0.12, 0])
  part(podium, rounded, charcoal, [-0.13, 1.058, -0.3], [0.37, 0.012, 0.12])
  // Boarding-pass reader and a compact printer sit beside the agent's display.
  box(podium, charcoal, [0.32, 1.09, 0.18], [0.12, 0.12, 0.12])
  part(podium, rounded, charcoal, [0.32, 1.17, 0.17], [0.15, 0.07, 0.18], [0.2, 0, 0])
  box(podium, readerLight, [0.32, 1.205, 0.165], [0.08, 0.003, 0.063])
  part(podium, rounded, doorMetal, [0.3, 1.1, -0.17], [0.19, 0.14, 0.22])
  box(podium, charcoal, [0.3, 1.126, -0.059], [0.13, 0.027, 0.006])
  box(podium, paper, [0.3, 1.174, -0.17], [0.135, 0.006, 0.105])

  const bridge = new THREE.Group()
  bridge.name = 'Gate 20 enclosed jetbridge'
  bridge.position.copy(door.position)
  bridge.rotation.y = door.rotation.y
  group.add(bridge)
  const corridorFrame = (start: THREE.Vector3, end: THREE.Vector3) => {
    const forward = end.clone().sub(start).normalize()
    const z = forward.clone().negate()
    const x = new THREE.Vector3(0, 1, 0).cross(z).normalize()
    const y = z.clone().cross(x).normalize()
    return new THREE.Matrix4()
      .makeBasis(x, y, z)
      .setPosition(start.clone().add(end).multiplyScalar(0.5))
  }
  function corridor(start: THREE.Vector3, end: THREE.Vector3, width: number) {
    const length = start.distanceTo(end)
    const frame = corridorFrame(start, end)
    box(bridge, bridgeRib, [0, 0.01, 0], [width + 0.1, 0.12, length], frame)
    box(bridge, roof, [0, 2.16, 0], [width + 0.18, 0.12, length + 0.04], frame)
    for (const side of [-1, 1]) {
      box(bridge, bridgeCladding, [(side * width) / 2, 1.085, 0], [0.07, 2.05, length], frame)
      for (const y of [0.13, 2.04])
        box(bridge, metal, [side * (width / 2 + 0.055), y, 0], [0.035, 0.08, length], frame)
      for (let z = -length / 2 + 0.12; z < length / 2; z += 0.18) {
        box(bridge, bridgeRib, [side * (width / 2 + 0.044), 1.085, z], [0.028, 1.83, 0.033], frame)
      }
    }
    // The slightly wider band marks the telescoping section overlap.
    const seam = -length * 0.15
    for (const side of [-1, 1])
      box(bridge, metal, [side * (width / 2 + 0.07), 1.1, seam], [0.065, 2.14, 0.14], frame)
    box(bridge, metal, [0, 2.22, seam], [width + 0.2, 0.065, 0.14], frame)
  }
  const start = new THREE.Vector3(0, 0.065, -0.125)
  const elbow = new THREE.Vector3(0, -0.18, -3.77)
  const end = new THREE.Vector3(-3.95, -0.5, -7.02)
  corridor(start, elbow, 1.46)
  corridor(elbow, end, 1.35)
  // A drum joint allows the outer corridor to turn toward the aircraft apron.
  part(bridge, cylinder, bridgeCladding, [elbow.x, elbow.y + 1.065, elbow.z], [0.91, 2.14, 0.91])
  part(bridge, cylinder, roof, [elbow.x, elbow.y + 2.155, elbow.z], [0.965, 0.075, 0.965])
  part(bridge, cylinder, bridgeRib, [elbow.x, elbow.y - 0.015, elbow.z], [0.93, 0.12, 0.93])
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2
    part(
      bridge,
      cube,
      bridgeRib,
      [elbow.x + Math.sin(angle) * 0.916, elbow.y + 1.05, elbow.z + Math.cos(angle) * 0.916],
      [0.026, 1.93, 0.025],
      [0, angle, 0],
    )
  }

  const heading = end.clone().sub(elbow)
  heading.y = 0
  heading.normalize()
  const yaw = Math.atan2(-heading.x, -heading.z)
  const headFrame = new THREE.Matrix4().makeRotationY(yaw).setPosition(end)
  // Dark accordion canopy: individual pleats around a recessed, open mouth.
  for (const side of [-1, 1])
    box(bridge, rubber, [side * 0.79, 1.09, -0.25], [0.09, 2.14, 0.66], headFrame)
  box(bridge, rubber, [0, 2.18, -0.25], [1.66, 0.1, 0.66], headFrame)
  box(bridge, charcoal, [0, 0.02, -0.25], [1.58, 0.09, 0.66], headFrame)
  for (let index = 0; index < 9; index++) {
    const z = 0.045 - index * 0.074
    for (const side of [-1, 1])
      box(bridge, pleat, [side * 0.84, 1.09, z], [0.08, 2.21, 0.028], headFrame)
    box(bridge, pleat, [0, 2.215, z], [1.76, 0.075, 0.028], headFrame)
  }
  // Small operator window on the side of the bridge head.
  box(bridge, bridgeCladding, [0.81, 1.04, 0.23], [0.17, 1.98, 0.64], headFrame)
  box(bridge, charcoal, [0.901, 1.5, 0.23], [0.014, 0.64, 0.5], headFrame)
  part(bridge, plane, glass, [0.91, 1.5, 0.23], [0.45, 0.59, 1], [0, Math.PI / 2, 0], headFrame)

  const supportOffset = 0.87
  const support = end.clone().addScaledVector(heading, -supportOffset)
  const outerHorizontalLength = Math.hypot(end.x - elbow.x, end.z - elbow.z)
  const supportFloor = THREE.MathUtils.lerp(end.y, elbow.y, supportOffset / outerHorizontalLength)
  const supportFrame = new THREE.Matrix4().makeRotationY(yaw).setPosition(support.x, 0, support.z)
  const wheelRadius = 0.17
  const wheelCenter = apronLevel + wheelRadius
  const chassisHeight = 0.16
  const chassisCenter = wheelCenter + 0.13
  const upperSupportCenter = supportFloor - 0.1
  const upperSupportThickness = 0.12
  const supportBottom = chassisCenter + chassisHeight / 2
  const supportTop = upperSupportCenter - upperSupportThickness / 2
  box(bridge, charcoal, [0, chassisCenter, 0], [1.34, chassisHeight, 0.5], supportFrame)
  box(bridge, metal, [0, upperSupportCenter, 0], [1.44, upperSupportThickness, 0.52], supportFrame)
  for (const side of [-1, 1]) {
    box(
      bridge,
      metal,
      [side * 0.44, (supportTop + supportBottom) / 2, 0],
      [0.12, supportTop - supportBottom, 0.16],
      supportFrame,
    )
    for (const z of [-0.17, 0.17]) {
      part(
        bridge,
        cylinder,
        rubber,
        [side * 0.68, wheelCenter, z],
        [wheelRadius, 0.13, wheelRadius],
        [0, 0, Math.PI / 2],
        supportFrame,
      )
      part(
        bridge,
        cylinder,
        metal,
        [side * 0.75, wheelCenter, z],
        [0.085, 0.01, 0.085],
        [0, 0, Math.PI / 2],
        supportFrame,
      )
    }
    box(bridge, amber, [side * 0.77, chassisCenter + 0.06, 0], [0.013, 0.045, 0.1], supportFrame)
  }
  const pedestalBaseHeight = 0.07
  const pedestalBottom = apronLevel + pedestalBaseHeight - 0.01
  const pedestalTop = elbow.y - 0.025
  part(
    bridge,
    cylinder,
    metal,
    [elbow.x, (pedestalBottom + pedestalTop) / 2, elbow.z],
    [0.15, pedestalTop - pedestalBottom, 0.15],
  )
  box(
    bridge,
    charcoal,
    [elbow.x, apronLevel + pedestalBaseHeight / 2, elbow.z],
    [0.65, pedestalBaseHeight, 0.65],
  )

  for (const batch of batches.values()) {
    const mesh = new THREE.InstancedMesh(batch.shape, batch.surface, batch.matrices.length)
    batch.matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix))
    mesh.castShadow = batch.surface !== glass
    mesh.receiveShadow = true
    mesh.computeBoundingSphere()
    batch.parent.add(mesh)
    instances.push(mesh)
  }

  return {
    group,
    dispose() {
      if (disposed) return
      disposed = true
      instances.forEach((mesh) => mesh.dispose())
      geometries.forEach((value) => value.dispose())
      materials.forEach((value) => value.dispose())
      textures.forEach((value) => value.dispose())
      group.clear()
    },
  }
}
