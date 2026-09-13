export interface SceneLayout {
  width: number
  height: number
  aircraftWidth: number
  aircraftGround: number
  vehicleScale: number
  vehicleGround: number
}

/** Only ambient routes need pixel measurements; belongings keep their CSS aspect ratios. */
export function getSceneLayout(width: number, height: number): SceneLayout {
  const portrait = width <= 700 && height > width
  return {
    width,
    height,
    aircraftWidth: width * (portrait ? 0.72 : 0.3),
    aircraftGround: height * (portrait ? 0.433 : 0.466),
    vehicleScale: width * (portrait ? 0.00155 : 0.001),
    vehicleGround: height * (portrait ? 0.463 : 0.519),
  }
}

/** Both ends are beyond the viewport, including the full sprite. */
export function loopPosition(
  elapsed: number,
  duration: number,
  width: number,
  spriteWidth: number,
  phase: number,
) {
  const fraction = (((elapsed / duration + phase) % 1) + 1) % 1
  return -spriteWidth - 24 + fraction * (width + spriteWidth + 48)
}

export const groundRoutes = [
  { name: 'provisioning', width: 94, duration: 108, phase: 0.72, direction: -1, lane: -0.018 },
  { name: 'baggage-train', width: 172, duration: 76, phase: 0.2, direction: 1, lane: 0 },
  { name: 'pushback', width: 69, duration: 132, phase: 0.14, direction: -1, lane: 0.018 },
] as const

export function groundPosition(
  route: (typeof groundRoutes)[number],
  elapsed: number,
  layout: SceneLayout,
) {
  const size = route.width * layout.vehicleScale
  const x = loopPosition(elapsed, route.duration, layout.width, size, route.phase)
  return route.direction === 1 ? x : layout.width - size - x
}
