import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { createTerminalEnvironment } from './terminal-environment'
import { getSceneLighting } from './scene-lighting'
import { createLaptopScreenTexture } from './laptop-screen'

export interface LiveScene {
  resize(width: number, height: number): void
  render(progress: number, elapsed: number, pointer: { x: number; y: number }, date?: Date): void
  dispose(): void
}

/** The whole terminal, laptop and aircraft are geometry rendered every frame. */
export function createLiveScene(
  container: HTMLElement,
  screenElement: HTMLElement,
  onChange: () => void = () => {},
): LiveScene {
  // Prepare the fallible 2D preview before allocating WebGL resources or
  // starting aircraft loading, and release it if WebGL is unavailable.
  const preview = createLaptopScreenTexture(screenElement, onChange)
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'low-power',
    })
  } catch (error) {
    preview.dispose()
    throw error
  }
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#dce7e9')
  scene.fog = new THREE.Fog('#dce7e9', 36, 95)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.25
  renderer.domElement.setAttribute(
    'aria-label',
    'Live 3D rendering of a gate at Dallas Love Field, with a MacBook on a table and aircraft beyond the windows',
  )
  renderer.domElement.setAttribute('role', 'img')
  container.appendChild(renderer.domElement)
  const camera = new THREE.PerspectiveCamera(44, 1, 0.04, 150)

  const hemisphere = new THREE.HemisphereLight('#eef5ff', '#99806a', 2.4)
  scene.add(hemisphere)
  const sunlight = new THREE.DirectionalLight('#fff0d9', 3.2)
  sunlight.position.set(-12, 14, -7)
  sunlight.target.position.set(1, 0, -5)
  sunlight.castShadow = true
  sunlight.shadow.mapSize.set(2048, 2048)
  sunlight.shadow.camera.left = -16
  sunlight.shadow.camera.right = 16
  sunlight.shadow.camera.top = 14
  sunlight.shadow.camera.bottom = -14
  sunlight.shadow.camera.far = 55
  sunlight.shadow.normalBias = 0.025
  sunlight.shadow.bias = -0.0002
  scene.add(sunlight, sunlight.target)
  const fill = new THREE.DirectionalLight('#e6f0ff', 1.5)
  fill.position.set(2, 5, 9)
  scene.add(fill)
  const practicals = [
    [0, 4.9, 1.3],
    [2.5, 4.9, -7.2],
    [-3.2, 4.9, -14.5],
  ].map(([x, y, z]) => {
    const light = new THREE.PointLight('#ffe3b5', 20, 15, 2)
    light.position.set(x, y, z)
    scene.add(light)
    return light
  })
  let lightingMinute = ''

  const environment = createTerminalEnvironment(onChange)
  scene.add(environment.group)
  const foreground = new THREE.Group()
  scene.add(foreground)
  const stone = new THREE.MeshStandardMaterial({ color: '#c8c4b9', roughness: 0.85 })
  const aluminum = new THREE.MeshStandardMaterial({
    color: '#4b4f52',
    metalness: 0.75,
    roughness: 0.32,
  })
  const bezel = new THREE.MeshStandardMaterial({
    color: '#101315',
    metalness: 0.25,
    roughness: 0.5,
  })
  const keyMaterial = new THREE.MeshStandardMaterial({ color: '#171a1c', roughness: 0.62 })
  const chrome = new THREE.MeshStandardMaterial({
    color: '#a6aaac',
    metalness: 0.85,
    roughness: 0.28,
  })
  const meshes: THREE.Mesh[] = []
  function box(
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material,
    radius = 0.015,
  ) {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, radius), material)
    mesh.position.set(x, y, z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    foreground.add(mesh)
    meshes.push(mesh)
    return mesh
  }
  box(8.5, 0.14, 3.05, 0, 0.78, 1, stone, 0.05)
  box(0.14, 0.73, 1.7, -2.8, 0.34, 1, aluminum)
  box(0.14, 0.73, 1.7, 2.8, 0.34, 1, aluminum)
  // MacBook Pro: beveled unibody, hinge, keyboard, speaker grilles and trackpad.
  box(2.68, 0.065, 1.72, 0, 0.888, 0.92, aluminum, 0.03)
  const lid = box(2.64, 1.69, 0.065, 0, 1.69, 0.18, aluminum, 0.045)
  lid.rotation.x = -0.085
  const frame = box(2.58, 1.63, 0.018, 0, 1.69, 0.221, bezel, 0.034)
  frame.rotation.x = -0.085
  box(2.12, 0.015, 0.76, 0, 0.932, 0.63, bezel, 0.02)
  const keyGeometry = new RoundedBoxGeometry(0.135, 0.014, 0.095, 1, 0.009)
  const keys = new THREE.InstancedMesh(keyGeometry, keyMaterial, 70)
  const matrix = new THREE.Matrix4()
  for (let row = 0; row < 5; row++)
    for (let col = 0; col < 14; col++) {
      matrix.makeTranslation((col - 6.5) * 0.143, 0.948, 0.36 + row * 0.122)
      keys.setMatrixAt(row * 14 + col, matrix)
    }
  keys.castShadow = true
  foreground.add(keys)
  box(0.94, 0.012, 0.1, 0, 0.948, 0.968, keyMaterial, 0.01)
  box(0.99, 0.01, 0.43, 0, 0.929, 1.367, chrome, 0.02)
  box(0.966, 0.01, 0.408, 0, 0.934, 1.367, aluminum, 0.018)
  const grille = new THREE.InstancedMesh(new THREE.BoxGeometry(0.011, 0.005, 0.55), keyMaterial, 24)
  for (let i = 0; i < 24; i++) {
    matrix.makeTranslation((i < 12 ? -1.2 : 1.09) + (i % 12) * 0.01, 0.925, 0.64)
    grille.setMatrixAt(i, matrix)
  }
  foreground.add(grille)
  box(0.15, 0.024, 0.023, 0, 2.466, 0.158, bezel, 0.01)

  const screenCenter = new THREE.Vector3(0, 1.69, 0.234)
  const screenMaterial = new THREE.MeshBasicMaterial({ map: preview.texture, toneMapped: false })
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.45, (2.45 * 371) / 603), screenMaterial)
  screen.position.copy(screenCenter)
  screen.rotation.x = -0.085
  foreground.add(screen)
  meshes.push(screen)

  // Keep a native link over the entire laptop for touch, keyboard and assistive
  // technology. Only WebGL draws the display, so browser zoom cannot separate
  // its contents from the bezel as it can with a second, CSS 3D renderer.
  const originalScreenParent = screenElement.parentElement
  container.appendChild(screenElement)
  const laptopCorners = [
    new THREE.Vector3(-1.34, 0.92, 1.78),
    new THREE.Vector3(1.34, 0.92, 1.78),
    new THREE.Vector3(-1.32, 2.53, 0.11),
    new THREE.Vector3(1.32, 2.53, 0.11),
    new THREE.Vector3(-1.34, 0.86, 0.06),
    new THREE.Vector3(1.34, 0.86, 0.06),
  ]
  const projected = new THREE.Vector3()
  function positionLaptopLink() {
    let left = width
    let right = 0
    let top = height
    let bottom = 0
    for (const corner of laptopCorners) {
      projected.copy(corner).applyMatrix4(foreground.matrixWorld).project(camera)
      const x = ((projected.x + 1) * width) / 2
      const y = ((1 - projected.y) * height) / 2
      left = Math.min(left, x)
      right = Math.max(right, x)
      top = Math.min(top, y)
      bottom = Math.max(bottom, y)
    }
    // Clamp the target as the camera enters the laptop and corners pass behind it.
    left = THREE.MathUtils.clamp(left, 0, width)
    right = THREE.MathUtils.clamp(right, left, width)
    top = THREE.MathUtils.clamp(top, 0, height)
    bottom = THREE.MathUtils.clamp(bottom, top, height)
    screenElement.style.transform = `translate(${left}px, ${top}px)`
    screenElement.style.width = `${right - left}px`
    screenElement.style.height = `${bottom - top}px`
  }

  let width = 1
  let height = 1
  const initialPosition = new THREE.Vector3()
  const initialTarget = new THREE.Vector3()
  const finalPosition = new THREE.Vector3()
  const currentTarget = new THREE.Vector3()
  const screenNormal = new THREE.Vector3(0, Math.sin(0.085), Math.cos(0.085))
  const ease = (t: number) => t * t * (3 - 2 * t)
  return {
    resize(w, h) {
      width = w
      height = h
      renderer.setSize(w, h)
      camera.aspect = w / h
      const portrait = camera.aspect < 0.85
      // Preserve the horizontal view on portrait screens so both gates and the
      // window seating remain in view instead of cropping to the laptop alone.
      camera.fov = portrait
        ? THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(Math.PI / 6) / camera.aspect))
        : 44
      camera.updateProjectionMatrix()
      foreground.position.x = portrait ? 0.85 : 0
      screenCenter.set(foreground.position.x, 1.69, 0.234)
      initialPosition.set(portrait ? 0.85 : 0.35, portrait ? 2.25 : 2.5, portrait ? 5.1 : 6)
      initialTarget.set(foreground.position.x, portrait ? 2.1 : 2.05, -1.8)
      // End just inside the screen so the HTML portfolio can take over edge-to-edge.
      const verticalDistance = 1.505 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))
      const horizontalDistance =
        2.45 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect)
      finalPosition
        .copy(screenCenter)
        .addScaledVector(screenNormal, Math.min(verticalDistance, horizontalDistance) * 0.985)
    },
    render(progress, elapsed, pointer, date = new Date()) {
      const minute = `${date.getHours()}:${date.getMinutes()}:${date.getTimezoneOffset()}`
      if (minute !== lightingMinute) {
        const lighting = getSceneLighting(date)
        ;(scene.background as THREE.Color).copy(lighting.sky)
        ;(scene.fog as THREE.Fog).color.copy(lighting.sky)
        hemisphere.color.copy(lighting.hemisphere)
        hemisphere.groundColor.copy(lighting.ground)
        hemisphere.intensity = lighting.ambient
        sunlight.color.copy(lighting.sun)
        sunlight.intensity = lighting.sunlight
        sunlight.position.set(...lighting.sunPosition)
        fill.color.copy(lighting.fill)
        fill.intensity = lighting.fillIntensity
        for (const practical of practicals) practical.intensity = lighting.practical
        environment.setDaylight(lighting.daylight)
        container.dataset.localHour = String(lighting.hour)
        container.dataset.daylight = lighting.daylight.toFixed(3)
        container.dataset.night = String(lighting.daylight < 0.2)
        lightingMinute = minute
      }
      const t = ease(progress)
      camera.position.lerpVectors(initialPosition, finalPosition, t)
      camera.position.x += pointer.x * 0.16 * (1 - t)
      camera.position.y += pointer.y * 0.07 * (1 - t)
      currentTarget.lerpVectors(initialTarget, screenCenter, t)
      camera.lookAt(currentTarget)
      environment.update(elapsed)
      renderer.render(scene, camera)
      positionLaptopLink()
      container.dataset.renderSize = `${width}x${height}`
    },
    dispose() {
      environment.dispose()
      for (const mesh of meshes) mesh.geometry.dispose()
      keys.dispose()
      grille.dispose()
      sunlight.shadow.dispose()
      keys.geometry.dispose()
      grille.geometry.dispose()
      preview.dispose()
      for (const material of [stone, aluminum, bezel, keyMaterial, chrome, screenMaterial])
        material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      screenElement.removeAttribute('style')
      if (originalScreenParent) originalScreenParent.appendChild(screenElement)
      else screenElement.remove()
    },
  }
}
