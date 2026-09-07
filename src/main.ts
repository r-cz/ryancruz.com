import { renderPage } from './page'
import type { LiveScene } from './scene3d'

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))
export const transitionProgress = (scroll: number, distance: number) =>
  clamp(scroll / Math.max(distance, 1))

export function initSite() {
  const app = document.querySelector<HTMLElement>('#app')
  if (!app) return () => {}
  if (!app.querySelector('#portfolio')) app.innerHTML = renderPage()
  const track = app.querySelector<HTMLElement>('.scene-track')
  const viewport = app.querySelector<HTMLElement>('.scene-viewport')
  const camera = app.querySelector<HTMLElement>('.scene-camera')
  const portfolio = app.querySelector<HTMLElement>('#portfolio')
  const laptop = app.querySelector<HTMLElement>('.laptop-screen')
  const toggle = app.querySelector<HTMLButtonElement>('.motion-toggle')
  if (!track || !viewport || !camera || !portfolio || !laptop || !toggle) return () => {}
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  let manuallyPaused = false
  try {
    manuallyPaused = window.localStorage.getItem('ryan-motion-paused') === 'true'
  } catch {
    /* Storage is optional. */
  }
  let liveScene: LiveScene | undefined
  let frame = 0
  let needsResize = false
  let sceneWidth = 0
  let sceneHeight = 0
  let resizeObserver: ResizeObserver | undefined
  const visualViewport = window.visualViewport
  let entering: number | undefined
  let clockInterval: number | undefined
  let travel = 1
  let measured = false
  let disposed = false
  let elapsed = 0
  let previousTime = 0
  let failed = false
  const pointer = { x: 0, y: 0 }
  document.documentElement.classList.add('enhanced')

  function updateMotionControls() {
    const paused = manuallyPaused || reduced.matches
    document.documentElement.classList.toggle('motion-paused', paused)
    toggle?.setAttribute('aria-pressed', String(paused))
    toggle?.setAttribute(
      'aria-label',
      reduced.matches
        ? 'Motion disabled by system preference'
        : paused
          ? 'Resume ambient motion'
          : 'Pause ambient motion',
    )
    const label = toggle?.querySelector('span')
    if (label)
      label.textContent = reduced.matches
        ? 'Motion reduced'
        : paused
          ? 'Resume motion'
          : 'Pause motion'
    if (toggle) toggle.disabled = reduced.matches
    schedule()
  }
  function render(time = 0) {
    if (needsResize) {
      needsResize = false
      resize()
    }
    frame = 0
    if (disposed || failed || !measured || !camera || !portfolio || !laptop) return
    const progress = transitionProgress(window.scrollY, travel)
    updateClock(progress)
    const animated = !manuallyPaused && !reduced.matches && !document.hidden && progress < 1
    if (animated && previousTime) elapsed += Math.min((time - previousTime) / 1000, 0.06)
    previousTime = time
    try {
      liveScene?.render(
        reduced.matches ? 0 : progress,
        elapsed,
        animated ? pointer : { x: 0, y: 0 },
        new Date(),
      )
    } catch {
      revealContent()
      return
    }
    camera.style.opacity = String(1 - clamp((progress - 0.91) / 0.09))
    const contentVisible = progress >= 0.995
    portfolio.style.opacity = String(clamp((progress - 0.88) / 0.12))
    document.documentElement.style.setProperty('--chrome-opacity', String(1 - clamp(progress * 3)))
    document.documentElement.classList.toggle('in-portfolio', contentVisible)
    laptop.tabIndex = progress < 0.1 ? 0 : -1
    if (track) track.inert = contentVisible
    if (liveScene && animated) schedule()
  }
  function schedule() {
    if (!frame && !document.hidden && !disposed && !failed)
      frame = window.requestAnimationFrame(render)
  }
  function queueResize() {
    if (disposed || failed) return
    needsResize = true
    schedule()
  }
  function stopObservingSize() {
    resizeObserver?.disconnect()
    window.removeEventListener('resize', queueResize)
    window.removeEventListener('pageshow', queueResize)
    visualViewport?.removeEventListener('resize', queueResize)
    needsResize = false
  }
  function stopClock() {
    if (clockInterval !== undefined) window.clearInterval(clockInterval)
    clockInterval = undefined
  }
  function updateClock(progress = transitionProgress(window.scrollY, travel)) {
    if (!liveScene || disposed || failed || document.hidden || progress >= 1) {
      stopClock()
      return
    }
    if (clockInterval === undefined) {
      // The visitor's clock keeps advancing even when ambient motion is paused.
      clockInterval = window.setInterval(() => {
        updateClock()
        if (clockInterval !== undefined) schedule()
      }, 60_000)
    }
  }
  function resize() {
    if (!viewport || !track || failed || disposed) return
    // Canvas, camera and projected controls all use this same layout box.
    // Pinch zoom changes the visual viewport, not these CSS dimensions.
    const width = viewport.clientWidth
    const height = viewport.clientHeight
    if (width <= 0 || height <= 0) return
    const oldTravel = travel
    const oldScroll = window.scrollY
    travel = Math.round(height * (width <= 700 || reduced.matches ? 0.55 : 0.95))
    track.style.height = `${height + travel}px`
    document.documentElement.style.setProperty('--scene-height', `${height}px`)
    if (measured && travel !== oldTravel) {
      const top =
        oldScroll >= oldTravel - 1
          ? oldScroll + travel - oldTravel
          : transitionProgress(oldScroll, oldTravel) * travel
      window.scrollTo({ top, behavior: 'instant' })
    }
    measured = true
    try {
      // Initial layout is measured before the asynchronous scene exists.
      if (liveScene && (width !== sceneWidth || height !== sceneHeight)) {
        liveScene.resize(width, height)
        sceneWidth = width
        sceneHeight = height
      }
    } catch {
      revealContent()
      return
    }
  }
  function revealContent() {
    failed = true
    stopObservingSize()
    stopClock()
    if (entering) {
      window.clearTimeout(entering)
      entering = undefined
    }
    window.cancelAnimationFrame(frame)
    frame = 0
    document.documentElement.classList.remove('enhanced', 'scene-ready')
    document.documentElement.classList.add('scene-unavailable')
    portfolio?.style.removeProperty('opacity')
    track?.style.removeProperty('height')
    liveScene?.dispose()
    liveScene = undefined
  }
  function navigate(event: MouseEvent) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
      return
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
    if (!link || failed) return
    const id = link.getAttribute('href')?.slice(1)
    const target = id ? document.getElementById(id) : null
    if (!target) return
    event.preventDefault()
    if (entering) window.clearTimeout(entering)
    const top =
      id === 'terminal'
        ? 0
        : id === 'portfolio'
          ? travel
          : target.getBoundingClientRect().top + window.scrollY - 36
    window.history.pushState(null, '', `#${id}`)
    const skip = link.classList.contains('skip-scene') || link.classList.contains('keyboard-skip')
    const smooth = !reduced.matches && !skip
    window.scrollTo({ top, behavior: smooth ? 'smooth' : 'instant' })
    entering = window.setTimeout(
      () => {
        entering = undefined
        const focus = id === 'terminal' ? laptop : target
        if (!focus) return
        if (!focus.hasAttribute('tabindex')) focus.setAttribute('tabindex', '-1')
        focus.focus({ preventScroll: true })
        schedule()
      },
      smooth ? 850 : 0,
    )
  }
  function followHash() {
    if (entering) {
      window.clearTimeout(entering)
      entering = undefined
    }
    const id = window.location.hash.slice(1)
    const target = document.getElementById(id || 'terminal')
    if (!target || failed) return
    window.scrollTo({
      top:
        !id || id === 'terminal'
          ? 0
          : id === 'portfolio'
            ? travel
            : target.getBoundingClientRect().top + window.scrollY - 36,
      behavior: 'instant',
    })
    schedule()
  }
  function onFocus(event: FocusEvent) {
    if (
      portfolio?.contains(event.target as Node) &&
      window.scrollY < travel &&
      !entering &&
      !failed
    ) {
      window.scrollTo({ top: travel, behavior: 'instant' })
      schedule()
    }
  }
  function onToggle() {
    manuallyPaused = !manuallyPaused
    try {
      window.localStorage.setItem('ryan-motion-paused', String(manuallyPaused))
    } catch {
      /* Continue without persistence. */
    }
    updateMotionControls()
  }
  function onPreference() {
    queueResize()
    updateMotionControls()
  }
  function onVisibility() {
    previousTime = 0
    if (document.hidden) {
      stopClock()
      window.cancelAnimationFrame(frame)
      frame = 0
    } else {
      updateClock()
      queueResize()
    }
  }
  function onPointer(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return
    const rect = viewport?.getBoundingClientRect()
    if (!rect || rect.width <= 0 || rect.height <= 0) return
    pointer.x = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1)
    pointer.y = clamp(1 - ((event.clientY - rect.top) / rect.height) * 2, -1, 1)
    schedule()
  }
  app.addEventListener('click', navigate)
  app.addEventListener('focusin', onFocus)
  toggle.addEventListener('click', onToggle)
  viewport.addEventListener('pointermove', onPointer)
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', queueResize)
  window.addEventListener('hashchange', followHash)
  window.addEventListener('pageshow', queueResize)
  visualViewport?.addEventListener('resize', queueResize)
  if (typeof window.ResizeObserver === 'function') {
    resizeObserver = new window.ResizeObserver(queueResize)
    resizeObserver.observe(viewport)
  }
  document.addEventListener('visibilitychange', onVisibility)
  reduced.addEventListener('change', onPreference)
  resize()
  updateMotionControls()
  if (window.location.hash) followHash()
  void import('./scene3d')
    .then(({ createLiveScene }) => {
      if (disposed || failed) return
      liveScene = createLiveScene(camera, laptop, schedule)
      camera.querySelector('.scene-loading')?.remove()
      document.documentElement.classList.add('scene-ready')
      camera.querySelector('canvas')?.addEventListener(
        'webglcontextlost',
        (event) => {
          event.preventDefault()
          revealContent()
        },
        { once: true },
      )
      resize()
      if (window.location.hash) followHash()
      schedule()
    })
    .catch(() => {
      if (!disposed) revealContent()
    })
  return () => {
    disposed = true
    stopObservingSize()
    stopClock()
    window.cancelAnimationFrame(frame)
    if (entering) window.clearTimeout(entering)
    liveScene?.dispose()
    app.removeEventListener('click', navigate)
    app.removeEventListener('focusin', onFocus)
    toggle.removeEventListener('click', onToggle)
    viewport.removeEventListener('pointermove', onPointer)
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('hashchange', followHash)
    document.removeEventListener('visibilitychange', onVisibility)
    reduced.removeEventListener('change', onPreference)
  }
}

if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', () => initSite(), { once: true })
else initSite()
