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
  const board = app.querySelector<HTMLElement>('.departure-board')
  const toggle = app.querySelector<HTMLButtonElement>('.motion-toggle')
  if (!track || !viewport || !camera || !portfolio || !laptop || !board || !toggle) return () => {}
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  let manuallyPaused = false
  try {
    manuallyPaused = window.localStorage.getItem('ryan-motion-paused') === 'true'
  } catch {
    /* Storage is optional. */
  }
  let liveScene: LiveScene | undefined
  let frame = 0
  let entering: number | undefined
  let clockInterval: number | undefined
  let travel = 1
  let measured = false
  let disposed = false
  let elapsed = 0
  let previousTime = 0
  let lastBoardUpdate = 0
  let flightStep = 0
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
    frame = 0
    if (disposed || failed || !camera || !portfolio || !laptop) return
    const progress = transitionProgress(window.scrollY, travel)
    updateClock(progress)
    const animated = !manuallyPaused && !reduced.matches && !document.hidden && progress < 1
    if (animated && previousTime) elapsed += Math.min((time - previousTime) / 1000, 0.06)
    previousTime = time
    if (elapsed - lastBoardUpdate > 11) {
      const cells = board?.querySelectorAll<HTMLElement>('[data-flight-status]')
      if (cells?.length) {
        const cell = cells[flightStep++ % cells.length]
        cell.textContent = cell.textContent === 'ON TIME' ? 'BOARDING' : 'ON TIME'
        cell.classList.remove('board-updated')
        void cell.offsetWidth
        cell.classList.add('board-updated')
      }
      lastBoardUpdate = elapsed
    }
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
    if (!frame && !document.hidden && !disposed) frame = window.requestAnimationFrame(render)
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
    if (!viewport || !track || failed) return
    const oldTravel = travel
    const oldScroll = window.scrollY
    const height = viewport.clientHeight
    travel = Math.round(height * (window.innerWidth <= 700 || reduced.matches ? 0.55 : 0.95))
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
      liveScene?.resize(window.innerWidth, height)
    } catch {
      revealContent()
      return
    }
    schedule()
  }
  function revealContent() {
    failed = true
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
    resize()
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
      schedule()
    }
  }
  function onPointer(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = 1 - (event.clientY / window.innerHeight) * 2
    schedule()
  }
  app.addEventListener('click', navigate)
  app.addEventListener('focusin', onFocus)
  toggle.addEventListener('click', onToggle)
  viewport.addEventListener('pointermove', onPointer)
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', resize)
  window.addEventListener('hashchange', followHash)
  window.addEventListener('pageshow', resize)
  document.addEventListener('visibilitychange', onVisibility)
  reduced.addEventListener('change', onPreference)
  resize()
  updateMotionControls()
  if (window.location.hash) followHash()
  void import('./scene3d')
    .then(({ createLiveScene }) => {
      if (disposed) return
      liveScene = createLiveScene(camera, laptop, board, schedule)
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
    stopClock()
    window.cancelAnimationFrame(frame)
    if (entering) window.clearTimeout(entering)
    liveScene?.dispose()
    app.removeEventListener('click', navigate)
    app.removeEventListener('focusin', onFocus)
    toggle.removeEventListener('click', onToggle)
    viewport.removeEventListener('pointermove', onPointer)
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', resize)
    window.removeEventListener('hashchange', followHash)
    window.removeEventListener('pageshow', resize)
    document.removeEventListener('visibilitychange', onVisibility)
    reduced.removeEventListener('change', onPreference)
  }
}

if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', () => initSite(), { once: true })
else initSite()
