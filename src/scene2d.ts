import { renderSceneArt } from './scene-art'
import { loadSceneArtwork } from './scene-assets'
import { getSceneLayout, loopPosition, sceneTransform, type SceneLayout } from './scene-layout'
import { getSceneLighting } from './scene-lighting'

export interface LiveScene {
  readonly ready?: Promise<void>
  resize(width: number, height: number): void
  render(progress: number, elapsed: number, pointer: { x: number; y: number }, date?: Date): void
  dispose(): void
}

export function createLiveScene(
  container: HTMLElement,
  laptop: HTMLElement,
  invalidate: () => void,
): LiveScene {
  const surfaces = laptop.parentElement
  if (!surfaces) throw new Error('Laptop display container is missing')
  container.insertAdjacentHTML('beforeend', renderSceneArt())
  const required = (selector: string) => {
    const node = container.querySelector<HTMLElement>(selector)
    if (!node) throw new Error(`Scene layer missing: ${selector}`)
    return node
  }
  const world = required('.scene-world')
  const shell = required('.laptop-shell')
  const outdoors = required('.outdoors')
  const aircraft = required('.aircraft-track')
  const farCloud = required('.cloud-far')
  const nearCloud = required('.cloud-near')
  let layout: SceneLayout | undefined
  let disposed = false
  let lastTransform = ''
  let lightingMinute = ''
  let lastElapsed = -1
  let lastPointer = ''
  let lastScreenOpacity = -1
  const artwork = loadSceneArtwork((name) => {
    world
      .querySelectorAll(name === 'aircraft' ? '.aircraft-track' : '.cloud')
      .forEach((node) => node.remove())
  })
  const ready = artwork.ready.then(() => {
    if (!disposed) invalidate()
  })

  return {
    ready,
    resize(width, height) {
      if (disposed || width <= 0 || height <= 0) return
      layout = getSceneLayout(width, height)
      const place = (
        node: HTMLElement,
        box: { x: number; y: number; width: number; height: number },
      ) => {
        Object.assign(node.style, {
          left: `${box.x}px`,
          top: `${box.y}px`,
          width: `${box.width}px`,
          height: `${box.height}px`,
        })
      }
      place(shell, layout.laptop)
      place(laptop, layout.screen)
      laptop.style.setProperty('--screen-unit', `${layout.screen.width / 440}px`)
      const origin = `${layout.screen.x + layout.screen.width / 2}px ${layout.screen.y + layout.screen.height / 2}px`
      world.style.transformOrigin = surfaces.style.transformOrigin = origin
      aircraft.style.width = `${layout.aircraftWidth}px`
      aircraft.style.bottom = `${height - layout.aircraftGround}px`
      lastTransform = ''
      lastElapsed = -1
    },
    render(progress, elapsed, pointer, date = new Date()) {
      if (disposed || !layout) return
      const transform = sceneTransform(layout, progress)
      if (transform !== lastTransform) {
        world.style.transform = surfaces.style.transform = transform
        lastTransform = transform
      }
      const screenOpacity = 1 - Math.min(1, Math.max(0, (progress - 0.91) / 0.09))
      if (screenOpacity !== lastScreenOpacity) {
        surfaces.style.opacity = String(screenOpacity)
        lastScreenOpacity = screenOpacity
      }
      if (elapsed !== lastElapsed) {
        aircraft.style.transform = `translateX(${loopPosition(elapsed, 90, layout.width, layout.aircraftWidth, 0.56)}px)`
        farCloud.style.transform = `translateX(${loopPosition(elapsed, 260, layout.width, layout.width * 0.7, 0.6)}px)`
        nearCloud.style.transform = `translateX(${loopPosition(elapsed, 180, layout.width, layout.width * 0.7, 0.24)}px)`
        lastElapsed = elapsed
      }
      const pointerKey = `${pointer.x},${pointer.y}`
      if (pointerKey !== lastPointer) {
        outdoors.style.transform = `translate(${Math.max(-1, Math.min(1, pointer.x)) * 6}px, ${Math.max(-1, Math.min(1, pointer.y)) * 3}px)`
        lastPointer = pointerKey
      }
      const minute = `${date.getHours()}:${date.getMinutes()}:${date.getTimezoneOffset()}`
      if (minute !== lightingMinute) {
        const light = getSceneLighting(date)
        world.style.setProperty('--sky-color', light.sky)
        world.style.setProperty('--daylight', String(light.daylight))
        world.style.setProperty('--night', String(light.night))
        world.style.setProperty('--sunset', String(light.sunset))
        world.style.setProperty('--exterior-brightness', String(light.exteriorBrightness))
        world.style.setProperty('--interior-brightness', String(light.interiorBrightness))
        container.dataset.localHour = String(light.hour)
        container.dataset.night = String(light.daylight < 0.2)
        lightingMinute = minute
      }
    },
    dispose() {
      if (disposed) return
      disposed = true
      artwork.dispose()
      world.remove()
      surfaces.style.removeProperty('transform')
      surfaces.style.removeProperty('transform-origin')
      surfaces.style.removeProperty('opacity')
      laptop.removeAttribute('style')
    },
  }
}
