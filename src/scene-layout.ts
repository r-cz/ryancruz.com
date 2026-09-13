export interface SceneLayout {
  width: number
  height: number
  laptop: { x: number; y: number; width: number; height: number }
  screen: { x: number; y: number; width: number; height: number }
  aircraftWidth: number
  aircraftGround: number
}

/** A single box drives both the painted laptop and its live HTML display. */
export function getSceneLayout(width: number, height: number): SceneLayout {
  const portrait = width <= 700 && height > width
  const short = height <= 500 && width >= height
  const laptopWidth = portrait ? width * 0.94 : Math.min(width * 0.41, height * 0.6)
  const laptopHeight = portrait
    ? Math.min(Math.max(height * 0.285, 180), laptopWidth * 0.76, height * 0.32)
    : (laptopWidth * 2) / 3
  const x = (width - laptopWidth) / 2
  const y = portrait
    ? Math.min(height * 0.58, height - laptopHeight - 106)
    : short
      ? height * 0.47
      : height * 0.495
  return {
    width,
    height,
    laptop: { x, y, width: laptopWidth, height: laptopHeight },
    screen: {
      x: x + laptopWidth * 0.147,
      y: y + laptopHeight * 0.105,
      width: laptopWidth * 0.709,
      height: laptopHeight * 0.586,
    },
    aircraftWidth: width * (portrait ? 0.5 : 0.3),
    aircraftGround: height * (portrait ? 0.448 : 0.466),
  }
}

/** Both ends of a loop are beyond the viewport, including the entire sprite. */
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

export function sceneTransform(layout: SceneLayout, progress: number) {
  const p = Math.min(1, Math.max(0, progress))
  const blend = p * p * (3 - 2 * p)
  const { screen } = layout
  const scale =
    1 + (Math.max(layout.width / screen.width, layout.height / screen.height) - 1) * blend
  const x = (layout.width / 2 - (screen.x + screen.width / 2)) * blend
  const y = (layout.height / 2 - (screen.y + screen.height / 2)) * blend
  return `translate(${x}px, ${y}px) scale(${scale})`
}
