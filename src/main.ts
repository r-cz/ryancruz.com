import { renderPage } from './page'
import type { LiveScene } from './scene2d'

export function initSite() {
  const app = document.querySelector<HTMLElement>('#app')
  if (!app || app.querySelector('.travel-page')) return () => {}
  if (!app.querySelector('#portfolio')) app.innerHTML = renderPage()
  const track = app.querySelector<HTMLElement>('.scene-track')
  const viewport = app.querySelector<HTMLElement>('.scene-viewport')
  const camera = app.querySelector<HTMLElement>('.scene-camera')
  if (!track || !viewport || !camera) return () => {}
  const sceneElements = { track, viewport }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  let liveScene: LiveScene | undefined
  let frame = 0
  let clock: number | undefined
  let disposed = false
  let failed = false
  let needsResize = true
  let width = 0
  let height = 0
  let sceneTop = 0
  let elapsed = 0
  let previousTime: number | undefined
  const pointer = { x: 0, y: 0 }
  const root = document.documentElement
  root.classList.add('enhanced')

  const visible = () =>
    !document.hidden &&
    window.scrollY < sceneTop + height &&
    window.scrollY + window.innerHeight > sceneTop
  function stopClock() {
    if (clock !== undefined) window.clearInterval(clock)
    clock = undefined
  }
  function stopAnimation() {
    window.cancelAnimationFrame(frame)
    frame = 0
    previousTime = undefined
    stopClock()
  }
  function fallback() {
    failed = true
    stopAnimation()
    observer?.disconnect()
    liveScene?.dispose()
    liveScene = undefined
    root.classList.remove('enhanced', 'scene-ready', 'scene-inactive')
    root.classList.add('scene-unavailable')
    // Preserve the destination if the scene vanishes while following a deep link.
    followInitialHash()
  }
  function schedule() {
    if (!frame && !disposed && !failed && !document.hidden)
      frame = window.requestAnimationFrame(render)
  }
  function resize() {
    const nextWidth = sceneElements.viewport.clientWidth
    const nextHeight = sceneElements.viewport.clientHeight
    sceneTop = sceneElements.track.offsetTop
    if (nextWidth <= 0 || nextHeight <= 0) return
    if (nextWidth !== width || nextHeight !== height || needsResize) {
      liveScene?.resize(nextWidth, nextHeight)
      width = nextWidth
      height = nextHeight
    }
    needsResize = false
  }
  function render(time: number) {
    frame = 0
    if (disposed || failed) return
    try {
      if (needsResize) resize()
      const active = visible()
      root.classList.toggle('scene-inactive', !active)
      if (!active) {
        stopAnimation()
        return
      }
      if (clock === undefined && liveScene) clock = window.setInterval(schedule, 60_000)
      if (!reduced.matches && previousTime !== undefined)
        elapsed += Math.min((time - previousTime) / 1000, 0.06)
      previousTime = reduced.matches ? undefined : time
      liveScene?.render(0, elapsed, reduced.matches ? { x: 0, y: 0 } : pointer, new Date())
      if (liveScene && !reduced.matches) schedule()
    } catch {
      fallback()
    }
  }
  function queueResize() {
    needsResize = true
    schedule()
  }
  function onVisibility() {
    root.classList.toggle('scene-inactive', document.hidden || !visible())
    stopAnimation()
    if (!document.hidden) queueResize()
  }
  function onScroll() {
    const active = visible()
    root.classList.toggle('scene-inactive', !active)
    if (active) schedule()
    else stopAnimation()
  }
  function onPreference() {
    previousTime = undefined
    schedule()
  }
  function onPointer(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || reduced.matches || !visible()) return
    const rect = sceneElements.viewport.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    pointer.x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1))
    pointer.y = Math.max(-1, Math.min(1, 1 - ((event.clientY - rect.top) / rect.height) * 2))
  }
  // Keep native scrolling, hashes, history restoration and modified link clicks.
  // A focusable destination lets the browser move keyboard focus with its anchor jump.
  function onNavigate(event: MouseEvent) {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
    if (
      !link ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    const target = document.getElementById(link.hash.slice(1))
    if (target && !target.hasAttribute('tabindex')) target.tabIndex = -1
  }
  function followInitialHash() {
    const id = window.location.hash.slice(1)
    const target = id ? document.getElementById(id) : null
    if (target) {
      if (!target.hasAttribute('tabindex')) target.tabIndex = -1
      target.scrollIntoView({ behavior: 'instant', block: 'start' })
      target.focus({ preventScroll: true })
    }
  }
  const observer =
    typeof window.ResizeObserver === 'function' ? new window.ResizeObserver(queueResize) : undefined
  observer?.observe(viewport)
  window.addEventListener('resize', queueResize)
  window.addEventListener('pageshow', queueResize)
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  reduced.addEventListener('change', onPreference)
  viewport.addEventListener('pointermove', onPointer)
  app.addEventListener('click', onNavigate)
  // Align direct section links once, when enhancement adds the normal-height scene.
  resize()
  followInitialHash()
  schedule()
  void import('./scene2d')
    .then(async ({ createLiveScene }) => {
      if (disposed || failed) return
      liveScene = createLiveScene(camera, schedule)
      needsResize = true
      resize()
      await liveScene.ready
      if (disposed || failed) return
      camera.querySelector('.scene-loading')?.remove()
      root.classList.add('scene-ready')
      schedule()
    })
    .catch(() => {
      if (!disposed) fallback()
    })
  return () => {
    disposed = true
    stopAnimation()
    observer?.disconnect()
    liveScene?.dispose()
    window.removeEventListener('resize', queueResize)
    window.removeEventListener('pageshow', queueResize)
    window.removeEventListener('scroll', onScroll)
    document.removeEventListener('visibilitychange', onVisibility)
    reduced.removeEventListener('change', onPreference)
    viewport.removeEventListener('pointermove', onPointer)
    app.removeEventListener('click', onNavigate)
    root.classList.remove('enhanced', 'scene-ready', 'scene-inactive')
  }
}

if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', () => initSite(), { once: true })
else initSite()
