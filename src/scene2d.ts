import { renderSceneArt } from './scene-art'
import { loadSceneArtwork } from './scene-assets'
import {
  getSceneLayout,
  groundPosition,
  groundRoutes,
  loopPosition,
  type SceneLayout,
} from './scene-layout'
import { getSceneLighting } from './scene-lighting'

export interface LiveScene {
  readonly ready?: Promise<void>
  resize(width: number, height: number): void
  render(progress: number, elapsed: number, pointer: { x: number; y: number }, date?: Date): void
  dispose(): void
}

export function createLiveScene(container: HTMLElement, invalidate: () => void): LiveScene {
  container.insertAdjacentHTML('beforeend', renderSceneArt())
  const required = (selector: string) => {
    const node = container.querySelector<HTMLElement>(selector)
    if (!node) throw new Error(`Scene layer missing: ${selector}`)
    return node
  }
  const world = required('.scene-world')
  const stage = container.parentElement ?? container
  const outdoors = required('.outdoors')
  const aircraft = required('.aircraft-track')
  const farCloud = required('.cloud-far')
  const nearCloud = required('.cloud-near')
  const vehicles = groundRoutes.map((route) => ({
    route,
    node: required(`.vehicle-${route.name}`),
  }))
  let layout: SceneLayout | undefined
  let disposed = false
  let lightingMinute = ''
  let lastElapsed = -1
  let lastPointer = ''
  const artwork = loadSceneArtwork((name) => {
    world.querySelectorAll(`[data-ambient="${name}"]`).forEach((node) => node.remove())
  })
  const ready = artwork.ready.then(() => {
    if (!disposed) invalidate()
  })
  return {
    ready,
    resize(width, height) {
      if (disposed || width <= 0 || height <= 0) return
      layout = getSceneLayout(width, height)
      aircraft.style.width = `${layout.aircraftWidth}px`
      aircraft.style.bottom = `${height - layout.aircraftGround}px`
      for (const { route, node } of vehicles) {
        node.style.width = `${route.width * layout.vehicleScale}px`
        node.style.bottom = `${height - layout.vehicleGround - height * route.lane}px`
      }
      lastElapsed = -1
    },
    render(_progress, elapsed, pointer, date = new Date()) {
      if (disposed || !layout) return
      if (elapsed !== lastElapsed) {
        aircraft.style.transform = `translateX(${loopPosition(elapsed, 90, layout.width, layout.aircraftWidth, 0.56)}px)`
        farCloud.style.transform = `translateX(${loopPosition(elapsed, 260, layout.width, layout.width * 0.7, 0.6)}px)`
        nearCloud.style.transform = `translateX(${loopPosition(elapsed, 180, layout.width, layout.width * 0.7, 0.24)}px)`
        for (const { route, node } of vehicles)
          node.style.transform = `translateX(${groundPosition(route, elapsed, layout)}px)`
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
        stage.style.setProperty('--sky-color', light.sky)
        stage.style.setProperty('--daylight', String(light.daylight))
        stage.style.setProperty('--night', String(light.night))
        stage.style.setProperty('--sunset', String(light.sunset))
        stage.style.setProperty('--exterior-brightness', String(light.exteriorBrightness))
        stage.style.setProperty('--interior-brightness', String(light.interiorBrightness))
        container.dataset.localHour = String(light.hour)
        lightingMinute = minute
      }
    },
    dispose() {
      if (disposed) return
      disposed = true
      artwork.dispose()
      world.remove()
      for (const name of [
        'sky-color',
        'daylight',
        'night',
        'sunset',
        'exterior-brightness',
        'interior-brightness',
      ])
        stage.style.removeProperty(`--${name}`)
    },
  }
}
