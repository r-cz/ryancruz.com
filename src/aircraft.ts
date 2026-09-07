import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

export interface Aircraft {
  group: THREE.Group
  update(elapsed: number): void
  dispose(): void
}

type Point = [number, number, number]
type Section = [x: number, centerY: number, radiusY: number, radiusZ: number]

/**
 * Original 737-800 geometry, proportioned from Boeing's 737NG airport-planning
 * three-view drawing. Heart livery is drawn in code from Southwest's references.
 * See docs/aircraft-reference.md. No third-party model or texture is redistributed.
 */
export function createAircraft(): Aircraft {
  const group = new THREE.Group()
  group.name = 'Southwest-inspired Boeing 737-800'
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()
  const batches = new Map<THREE.Material, THREE.BufferGeometry[]>()
  const geometry = <T extends THREE.BufferGeometry>(value: T) => {
    geometries.add(value)
    return value
  }
  const material = (color: string, roughness = 0.42, metalness = 0.15) => {
    const value = new THREE.MeshStandardMaterial({ color, roughness, metalness })
    materials.add(value)
    return value
  }
  const blue = material('#274aaa')
  const silver = material('#bec4ce', 0.32, 0.65)
  const wingGray = material('#b6bcc4', 0.55, 0.35)
  const dark = material('#151f2d', 0.38, 0.3)
  const rubber = material('#1a2027', 0.8, 0.05)
  const cockpit = material('#152b40', 0.14, 0.45)
  const panel = material('#7e8796', 0.65, 0.2)

  // Static details are merged by material into a few draw calls.
  function part(
    shape: THREE.BufferGeometry,
    surface: THREE.Material,
    position: Point = [0, 0, 0],
    rotation: Point = [0, 0, 0],
    scale: Point = [1, 1, 1],
  ) {
    const transform = new THREE.Matrix4().compose(
      new THREE.Vector3(...position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
      new THREE.Vector3(...scale),
    )
    const copy = shape.index ? shape.toNonIndexed() : shape.clone()
    copy.applyMatrix4(transform)
    if (transform.determinant() < 0) {
      // A baked mirror needs reversed triangle winding as well as flipped normals.
      for (const name of ['position', 'normal']) {
        const attribute = copy.getAttribute(name)
        if (!attribute) continue
        for (let i = 0; i < attribute.count; i += 3) {
          const x = attribute.getX(i),
            y = attribute.getY(i),
            z = attribute.getZ(i)
          attribute.setXYZ(i, attribute.getX(i + 2), attribute.getY(i + 2), attribute.getZ(i + 2))
          attribute.setXYZ(i + 2, x, y, z)
        }
      }
    }
    copy.deleteAttribute('uv')
    if (!copy.hasAttribute('normal')) copy.computeVertexNormals()
    const batch = batches.get(surface) ?? []
    batch.push(copy)
    batches.set(surface, batch)
  }

  function loft(sections: Section[], segments = 48, flattened = false) {
    const positions: number[] = [],
      uvs: number[] = [],
      indices: number[] = []
    sections.forEach(([x, centerY, radiusY, radiusZ], i) => {
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2
        const y = radiusY * Math.cos(theta)
        positions.push(
          x,
          centerY + (flattened ? Math.max(-0.235, y) : y),
          radiusZ * Math.sin(theta),
        )
        uvs.push((x + 5.5) / 11, 1 - j / segments)
        if (i < sections.length - 1 && j < segments) {
          const a = i * (segments + 1) + j,
            b = a + segments + 1
          indices.push(a, a + 1, b, b, a + 1, b + 1)
        }
      }
    })
    const result = geometry(new THREE.BufferGeometry())
    result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    result.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    result.setIndex(indices)
    result.computeVertexNormals()
    return result
  }

  const profile: Section[] = [
    [-5.5, 1.02, 0.007, 0.007],
    [-5.45, 1.025, 0.085, 0.08],
    [-5.35, 1.04, 0.15, 0.16],
    [-5.2, 1.07, 0.22, 0.24],
    [-5.0, 1.1, 0.3, 0.33],
    [-4.8, 1.135, 0.375, 0.4],
    [-4.6, 1.16, 0.435, 0.455],
    [-4.35, 1.18, 0.48, 0.49],
    [-4.05, 1.19, 0.515, 0.515],
    [-3.7, 1.19, 0.525, 0.523],
    [-3.2, 1.19, 0.53, 0.525],
    [-2, 1.19, 0.53, 0.525],
    [0, 1.19, 0.53, 0.525],
    [2, 1.19, 0.53, 0.525],
    [2.55, 1.2, 0.515, 0.512],
    [3, 1.215, 0.49, 0.48],
    [3.5, 1.25, 0.435, 0.425],
    [4, 1.3, 0.345, 0.32],
    [4.4, 1.35, 0.25, 0.22],
    [4.75, 1.4, 0.16, 0.13],
    [5.08, 1.445, 0.058, 0.048],
    [5.15, 1.45, 0.03, 0.027],
  ]
  const fuselageGeometry = loft(profile)
  const fuselageMaterial = material('#ffffff')
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const context = canvas.getContext('2d')
  if (context) {
    context.fillStyle = '#274aaa'
    context.fillRect(0, 0, 2048, 1024)
    const px = (x: number) => ((x + 5.5) / 11) * 2048
    for (const side of [1, -1]) {
      context.save()
      // The far-side wordmark reads correctly when looking from the other side.
      if (side < 0) {
        context.translate(2048, 1024)
        context.scale(-1, -1)
      }
      context.fillStyle = '#fffdf6'
      context.font = '700 112px Arial, sans-serif'
      context.fillText('Southwest', side > 0 ? px(-3.68) : 2048 - px(1.45), 270, 900)
      context.lineWidth = 2.2
      for (let x = -3.75; x < 3.45; x += 0.172) {
        if (Math.abs(x + 0.7) < 0.13 || Math.abs(x + 0.28) < 0.13) continue
        const cx = side > 0 ? px(x) : 2048 - px(x)
        context.fillStyle = '#132635'
        context.strokeStyle = '#bac8e1'
        context.beginPath()
        context.roundRect(cx - 6, 218, 12, 22, 5)
        context.fill()
        context.stroke()
      }
      for (const [x, height] of [
        [-4.15, 120],
        [3.85, 120],
        [-0.7, 69],
        [-0.28, 69],
      ]) {
        const cx = side > 0 ? px(x) : 2048 - px(x)
        context.strokeStyle = '#c3cce6'
        context.lineWidth = 2.4
        context.beginPath()
        context.roundRect(cx - 16, 202, 32, height, 5)
        context.stroke()
        context.fillStyle = '#b8c5df'
        context.fillRect(cx + 6, 258, 6, 3)
      }
      context.restore()
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    textures.add(texture)
    fuselageMaterial.map = texture
  } else {
    fuselageMaterial.color.copy(blue.color)
  }
  const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial)
  fuselage.name = 'Lofted 737 fuselage with curved livery'
  fuselage.castShadow = true
  fuselage.receiveShadow = true
  group.add(fuselage)

  // Each cockpit windshield is a separate angular panel on the sloping nose.
  function patch(points: Point[], surface: THREE.Material) {
    const shape = geometry(new THREE.BufferGeometry())
    shape.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3))
    shape.setIndex(Array.from({ length: points.length - 2 }, (_, i) => [0, i + 1, i + 2]).flat())
    shape.computeVertexNormals()
    const reverse = shape.clone()
    const index = reverse.getIndex()
    if (!index) throw new Error('Aircraft surface is missing triangle indices')
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i)
      index.setX(i, index.getX(i + 2))
      index.setX(i + 2, a)
    }
    reverse.computeVertexNormals()
    part(shape, surface)
    part(reverse, surface)
    reverse.dispose()
  }
  for (const side of [-1, 1]) {
    const z = (v: number) => side * v
    patch(
      [
        [-5.07, 1.3, z(0.2)],
        [-4.89, 1.44, z(0.23)],
        [-4.7, 1.45, z(0.34)],
        [-4.91, 1.32, z(0.35)],
      ],
      cockpit,
    )
    patch(
      [
        [-4.88, 1.32, z(0.37)],
        [-4.66, 1.46, z(0.36)],
        [-4.49, 1.43, z(0.42)],
        [-4.57, 1.31, z(0.455)],
      ],
      cockpit,
    )
    patch(
      [
        [-4.54, 1.31, z(0.465)],
        [-4.46, 1.43, z(0.435)],
        [-4.33, 1.405, z(0.46)],
        [-4.31, 1.31, z(0.486)],
      ],
      cockpit,
    )
  }

  // Thin, cambered aerofoils, with a swept leading edge and tapered trailing edge.
  // Sections run from root to tip: [z, leading x, trailing x, y, half-thickness].
  function aerofoil(sections: [number, number, number, number, number][]) {
    const points: number[] = [],
      indices: number[] = []
    for (const [z, leading, trailing, y, thickness] of sections) {
      for (const [chord, height] of [
        [0, 0],
        [0.14, 0.85],
        [0.38, 1],
        [0.7, 0.55],
        [1, 0],
        [0.7, -0.25],
        [0.38, -0.4],
        [0.14, -0.3],
      ]) {
        points.push(THREE.MathUtils.lerp(leading, trailing, chord), y + thickness * height, z)
      }
    }
    for (let i = 0; i < sections.length - 1; i++) {
      for (let j = 0; j < 8; j++) {
        const a = i * 8 + j,
          b = i * 8 + ((j + 1) % 8),
          c = a + 8,
          d = b + 8
        indices.push(a, c, b, b, c, d)
      }
    }
    const shape = geometry(new THREE.BufferGeometry())
    shape.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    shape.setIndex(indices)
    shape.computeVertexNormals()
    return shape
  }
  const mainWing = aerofoil([
    [0.36, -1.38, 0.58, 0.79, 0.15],
    [1.48, -0.84, 0.58, 0.87, 0.095],
    [3.8, 0.43, 1.3, 1.05, 0.04],
    [4.75, 1.05, 1.49, 1.13, 0.019],
  ])
  const stabilizer = aerofoil([
    [0.2, 3.65, 4.92, 1.48, 0.075],
    [1.8, 5.12, 5.48, 1.82, 0.025],
    [2, 5.34, 5.5, 1.86, 0.007],
  ])
  for (const side of [-1, 1]) {
    part(mainWing, wingGray, [0, 0, 0], [0, 0, 0], [1, 1, side])
    part(stabilizer, wingGray, [0, 0, 0], [0, 0, 0], [1, 1, side])
    // Winglets are curved upward continuations of the wing, not vertical blocks.
    const winglet = aerofoil([
      [4.7, 1.03, 1.5, 1.12, 0.018],
      [4.88, 1.14, 1.56, 1.25, 0.018],
      [4.96, 1.33, 1.66, 1.59, 0.015],
      [4.98, 1.58, 1.76, 1.97, 0.009],
    ])
    part(winglet, blue, [0, 0, 0], [0, 0, 0], [1, 1, side])
    // Flap hinges and engine pylons provide the layered silhouette below the wing.
    for (const [z, x] of [
      [1.8, 0.67],
      [2.8, 1.0],
      [3.6, 1.25],
    ]) {
      const fairing = geometry(new THREE.SphereGeometry(1, 12, 8))
      part(fairing, wingGray, [x, 0.83 + z * 0.05, side * z], [0, 0, 0], [0.35, 0.045, 0.045])
    }
    patch(
      [
        [-1.5, 0.63, side * 1.3],
        [-0.6, 0.98, side * 1.3],
        [0.02, 0.91, side * 1.3],
        [-0.53, 0.49, side * 1.3],
      ],
      wingGray,
    )
    patch(
      [
        [-0.18, 0.918, side * 2.05],
        [0.18, 0.924, side * 2.05],
        [1.25, 1.1, side * 4.45],
        [1.12, 1.1, side * 4.45],
      ],
      panel,
    )
  }

  // A swept dorsal fillet flows into the tall fin. Tail livery is one UV texture.
  const finShape = new THREE.Shape()
  finShape.moveTo(2.45, 1.7)
  finShape.quadraticCurveTo(3.1, 1.83, 3.48, 2.1)
  finShape.lineTo(4.7, 3.36)
  finShape.quadraticCurveTo(4.84, 3.51, 5.22, 3.48)
  finShape.lineTo(4.95, 1.45)
  finShape.closePath()
  const finGeometry = geometry(
    new THREE.ExtrudeGeometry(finShape, {
      depth: 0.065,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.017,
      bevelSegments: 2,
      curveSegments: 8,
      steps: 1,
    }),
  )
  finGeometry.translate(0, 0, -0.0325)
  const finCanvas = document.createElement('canvas')
  finCanvas.width = 512
  finCanvas.height = 512
  const finContext = finCanvas.getContext('2d')
  const finMaterial = material('#ffffff')
  if (finContext) {
    finContext.fillStyle = '#274aaa'
    finContext.fillRect(0, 0, 512, 512)
    // Broad rising ribbons continue the Heart tail's red / silver / yellow design.
    const ribbon = (color: string, points: [number, number][]) => {
      finContext.fillStyle = color
      finContext.beginPath()
      points.forEach(([x, y], i) => (i ? finContext.lineTo(x, y) : finContext.moveTo(x, y)))
      finContext.closePath()
      finContext.fill()
    }
    ribbon('#bdc6d4', [
      [0, 490],
      [510, 18],
      [512, 405],
      [210, 512],
    ])
    ribbon('#d42136', [
      [0, 488],
      [512, 88],
      [512, 377],
      [226, 512],
    ])
    ribbon('#bdc6d4', [
      [0, 376],
      [443, 0],
      [512, 0],
      [512, 89],
      [0, 491],
    ])
    ribbon('#f9b51b', [
      [0, 376],
      [443, 0],
      [496, 0],
      [512, 65],
      [0, 460],
    ])
    const finTexture = new THREE.CanvasTexture(finCanvas)
    finTexture.colorSpace = THREE.SRGBColorSpace
    textures.add(finTexture)
    finMaterial.map = finTexture
    const positions = finGeometry.getAttribute('position'),
      uv = finGeometry.getAttribute('uv')
    for (let i = 0; i < uv.count; i++)
      uv.setXY(i, (positions.getX(i) - 2.4) / 2.9, (positions.getY(i) - 1.4) / 2.15)
  } else finMaterial.color.copy(blue.color)
  const fin = new THREE.Mesh(finGeometry, finMaterial)
  fin.castShadow = true
  fin.receiveShadow = true
  group.add(fin)

  const cylinder = geometry(new THREE.CylinderGeometry(1, 1, 1, 24))
  const sphere = geometry(new THREE.SphereGeometry(1, 16, 10))
  // CFM56-7B nacelles have a flattened underside and a recessed inlet/fan.
  for (const side of [-1, 1]) {
    const nacelle = loft(
      [
        [-1.8, 0.47, 0.255, 0.27],
        [-1.75, 0.47, 0.3, 0.305],
        [-1.63, 0.47, 0.31, 0.31],
        [-1.2, 0.48, 0.285, 0.285],
        [-0.94, 0.48, 0.235, 0.24],
        [-0.72, 0.48, 0.185, 0.19],
      ],
      32,
      true,
    )
    part(nacelle, blue, [0, 0, side * 1.3])
    const lip = loft(
      [
        [-1.755, 0.47, 0.298, 0.305],
        [-1.815, 0.47, 0.26, 0.278],
        [-1.803, 0.47, 0.237, 0.252],
        [-1.67, 0.47, 0.225, 0.235],
      ],
      32,
      true,
    )
    part(lip, silver, [0, 0, side * 1.3])
    part(cylinder, dark, [-1.67, 0.47, side * 1.3], [0, 0, Math.PI / 2], [0.228, 0.01, 0.228])
    part(sphere, silver, [-1.72, 0.47, side * 1.3], [0, 0, 0], [0.07, 0.074, 0.074])
    part(cylinder, dark, [-0.725, 0.48, side * 1.3], [0, 0, Math.PI / 2], [0.155, 0.025, 0.155])
    for (let blade = 0; blade < 18; blade++) {
      const angle = (blade / 18) * Math.PI * 2
      patch(
        [
          [-1.682, 0.47 + Math.cos(angle) * 0.07, side * 1.3 + Math.sin(angle) * 0.07],
          [
            -1.682,
            0.47 + Math.cos(angle + 0.18) * 0.22,
            side * 1.3 + Math.sin(angle + 0.18) * 0.22,
          ],
          [
            -1.682,
            0.47 + Math.cos(angle + 0.32) * 0.22,
            side * 1.3 + Math.sin(angle + 0.32) * 0.22,
          ],
        ],
        panel,
      )
    }
  }
  // Correct 737 gear layout: nose gear well ahead of two twin-wheel main bogies.
  for (const [x, z, radius] of [
    [-4.36, 0, 0.13],
    [0, -0.8, 0.18],
    [0, 0.8, 0.18],
  ]) {
    part(cylinder, silver, [x, 0.47, z], [0, 0, 0], [0.023, 0.62, 0.023])
    for (const wheel of [-1, 1]) {
      const offset = wheel * (radius === 0.13 ? 0.075 : 0.12)
      part(
        cylinder,
        rubber,
        [x, radius, z + offset],
        [Math.PI / 2, 0, 0],
        [radius, radius * 0.6, radius],
      )
      part(
        cylinder,
        silver,
        [x, radius, z + offset + wheel * radius * 0.305],
        [Math.PI / 2, 0, 0],
        [radius * 0.48, 0.008, radius * 0.48],
      )
    }
  }
  part(cylinder, dark, [5.15, 1.45, 0], [0, 0, Math.PI / 2], [0.033, 0.055, 0.033])
  part(sphere, wingGray, [2.8, 1.718, 0], [0, 0, 0], [0.25, 0.055, 0.09])

  for (const [surface, shapes] of batches) {
    const combined = mergeGeometries(shapes)
    if (!combined) throw new Error('Aircraft geometry could not be merged')
    const merged = geometry(combined)
    const mesh = new THREE.Mesh(merged, surface)
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
    shapes.forEach((shape) => shape.dispose())
  }

  const beaconMaterial = new THREE.MeshBasicMaterial({ color: '#ff503f', toneMapped: false })
  materials.add(beaconMaterial)
  const beacon = new THREE.Mesh(sphere, beaconMaterial)
  beacon.scale.set(0.036, 0.025, 0.036)
  beacon.position.set(-0.15, 1.745, 0)
  group.add(beacon)
  for (const [side, color] of [
    [-1, '#7ce6ca'],
    [1, '#ff4353'],
  ] as const) {
    const navigationMaterial = new THREE.MeshBasicMaterial({ color, toneMapped: false })
    materials.add(navigationMaterial)
    const navigation = new THREE.Mesh(sphere, navigationMaterial)
    navigation.position.set(1.55, 1.95, side * 4.98)
    navigation.scale.setScalar(0.024)
    group.add(navigation)
  }

  return {
    group,
    update(elapsed) {
      // A restrained double pulse; elapsed comes from the scene's pauseable clock.
      const phase = elapsed % 2.2
      beacon.visible = phase < 0.1 || (phase > 0.23 && phase < 0.33)
    },
    dispose() {
      geometries.forEach((value) => value.dispose())
      materials.forEach((value) => value.dispose())
      textures.forEach((value) => value.dispose())
      group.clear()
    },
  }
}
