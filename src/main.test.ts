import { afterEach, beforeEach, describe, expect, it, mock, setSystemTime, spyOn } from 'bun:test'
import { renderPage } from './page'
import type { LiveScene } from './scene3d'

let failRenderer = false
let failRender = false
let failResize = false
const renderer = {
  render: mock<LiveScene['render']>(() => {
    if (failRender) throw new Error('Render failed')
  }),
  resize: mock<LiveScene['resize']>(() => {
    if (failResize) throw new Error('Resize failed')
  }),
  dispose: mock<LiveScene['dispose']>(() => {}),
}
const createLiveScene = mock((container: HTMLElement) => {
  if (failRenderer) throw new Error('WebGL is unavailable')
  container.append(document.createElement('canvas'))
  return renderer
})
mock.module('./scene3d', () => ({ createLiveScene }))
const { clamp, transitionProgress, initSite } = await import('./main')
// Consume browser auto-initialization before installing any test fixture.
document.dispatchEvent(new Event('DOMContentLoaded'))

let cleanup: (() => void) | undefined
let frameId = 0
let timerId = 0
let media: MediaQueryList
const frames = new Map<number, FrameRequestCallback>()
const timers = new Map<number, { callback: () => void; delay: number }>()
const intervals = new Map<number, { callback: () => void; delay: number }>()
const scrollTo = mock((options: ScrollToOptions | number, _y?: number) => {
  if (typeof options !== 'object') throw new Error('Expected scroll options')
  Object.defineProperty(window, 'scrollY', { configurable: true, value: options.top ?? 0 })
  window.dispatchEvent(new Event('scroll'))
})

function element<T extends HTMLElement = HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector)
  if (!found) throw new Error(`Missing test element: ${selector}`)
  return found
}

function flushFrame(time = 16) {
  const pending = [...frames.values()]
  frames.clear()
  pending.forEach((callback) => callback(time))
}

function flushTimers() {
  const pending = [...timers.values()]
  timers.clear()
  pending.forEach(({ callback }) => callback())
}

async function start() {
  cleanup = initSite()
  await new Promise<void>((resolve) => setTimeout(resolve, 0))
  flushFrame()
}

beforeEach(() => {
  document.body.innerHTML = `<div id="app">${renderPage()}</div>`
  document.documentElement.className = ''
  document.documentElement.removeAttribute('style')
  window.history.replaceState(null, '', '/')
  window.localStorage.clear()
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 })
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  Object.defineProperty(element('.scene-viewport'), 'clientHeight', { value: 900 })
  media = Object.assign(new window.EventTarget(), {
    matches: false,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
  }) as MediaQueryList
  // jsdom has no matchMedia, so provide it before creating a restorable spy.
  if (!window.matchMedia) window.matchMedia = () => media
  spyOn(window, 'matchMedia').mockImplementation(() => media)
  spyOn(window, 'scrollTo').mockImplementation(scrollTo)
  spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.set(++frameId, callback)
    return frameId
  })
  spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    frames.delete(id)
  })
  spyOn(window, 'setTimeout').mockImplementation((callback: TimerHandler, delay?: number) => {
    if (typeof callback !== 'function') throw new Error('Expected a timer callback')
    timers.set(++timerId, { callback: callback as () => void, delay: delay ?? 0 })
    return timerId
  })
  spyOn(window, 'clearTimeout').mockImplementation((id) => {
    if (id) timers.delete(id)
  })
  spyOn(window, 'setInterval').mockImplementation((callback: TimerHandler, delay?: number) => {
    if (typeof callback !== 'function') throw new Error('Expected an interval callback')
    intervals.set(++timerId, { callback: callback as () => void, delay: delay ?? 0 })
    return timerId
  })
  spyOn(window, 'clearInterval').mockImplementation((id) => {
    if (id) intervals.delete(id)
  })
  failRenderer = failRender = failResize = false
  frames.clear()
  timers.clear()
  intervals.clear()
  createLiveScene.mockClear()
  renderer.render.mockClear()
  renderer.resize.mockClear()
  renderer.dispose.mockClear()
  scrollTo.mockClear()
})

afterEach(() => {
  cleanup?.()
  cleanup = undefined
  frames.clear()
  timers.clear()
  intervals.clear()
  setSystemTime()
  document.body.innerHTML = ''
  mock.restore()
})

describe('portfolio document', () => {
  it('provides complete content and native anchors without running the renderer', () => {
    expect(document.querySelectorAll('main')).toHaveLength(1)
    expect(element('main h1').textContent).toBe('Ryan Cruz.')
    for (const id of ['portfolio', 'about', 'experience', 'projects', 'education', 'terminal']) {
      expect(document.getElementById(id)).not.toBeNull()
      expect(document.querySelector(`a[href="#${id}"]`)).not.toBeNull()
    }
    expect(element<HTMLAnchorElement>('a[href="/Resume.pdf"]').pathname).toBe('/Resume.pdf')
    expect(element('#experience').textContent).toContain('Southwest Airlines')
    expect(element('#education').textContent).toContain('University of Georgia')
    expect(document.documentElement.classList.contains('enhanced')).toBe(false)
    expect(createLiveScene).not.toHaveBeenCalled()
  })
})

describe('camera transition', () => {
  it('clamps before and after the scroll journey and handles zero travel', () => {
    expect(clamp(-2)).toBe(0)
    expect(clamp(4)).toBe(1)
    expect(clamp(4, 2, 6)).toBe(4)
    expect(transitionProgress(-100, 800)).toBe(0)
    expect(transitionProgress(400, 800)).toBe(0.5)
    expect(transitionProgress(1200, 800)).toBe(1)
    expect(transitionProgress(0, 0)).toBe(0)
    expect(transitionProgress(10, 0)).toBe(1)
  })

  it('preserves prerendered content while starting the live scene', async () => {
    const portfolio = element('#portfolio')
    await start()
    expect(element('#portfolio')).toBe(portfolio)
    expect(createLiveScene).toHaveBeenCalledTimes(1)
    expect(renderer.resize).toHaveBeenLastCalledWith(1280, 900)
    expect(document.documentElement.classList.contains('scene-ready')).toBe(true)
    expect(document.querySelector('.scene-loading')).toBeNull()
  })

  it('lets Skip to portfolio bypass camera motion and transfers keyboard focus', async () => {
    await start()
    element('.skip-scene').click()
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 855, behavior: 'instant' })
    expect([...timers.values()].map(({ delay }) => delay)).toEqual([0])
    flushTimers()
    flushFrame()
    expect(window.location.hash).toBe('#portfolio')
    expect(document.activeElement).toBe(element('#portfolio'))
    expect(element('#portfolio').style.opacity).toBe('1')
    expect(element('.scene-track').inert).toBe(true)
    expect(element('.laptop-screen').tabIndex).toBe(-1)
    expect(document.documentElement.classList.contains('in-portfolio')).toBe(true)
  })

  it('animates laptop entry and restores keyboard access on return to the terminal', async () => {
    await start()
    element('.laptop-screen').click()
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 855, behavior: 'smooth' })
    expect([...timers.values()].map(({ delay }) => delay)).toEqual([850])
    flushTimers()
    flushFrame()
    element('.back-to-terminal').click()
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'smooth' })
    flushTimers()
    flushFrame()
    expect(document.activeElement).toBe(element('.laptop-screen'))
    expect(element('.scene-track').inert).toBe(false)
    expect(element('.laptop-screen').tabIndex).toBe(0)
  })

  it('reveals the content if keyboard navigation reaches a portfolio link', async () => {
    await start()
    element<HTMLAnchorElement>('.portfolio-nav a').focus()
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 855, behavior: 'instant' })
    flushFrame()
    expect(document.documentElement.classList.contains('in-portfolio')).toBe(true)
  })

  it('opens a direct portfolio URL without an animated entrance', async () => {
    window.history.replaceState(null, '', '/#portfolio')
    await start()
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 855, behavior: 'instant' })
    expect(element('#portfolio').style.opacity).toBe('1')
  })

  it('keeps the portfolio visible when resizing from mobile to desktop', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
    await start()
    element('.skip-scene').click()
    expect(window.scrollY).toBeCloseTo(495)
    flushTimers()
    flushFrame()
    expect(element('#portfolio').style.opacity).toBe('1')
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 })
    window.dispatchEvent(new Event('resize'))
    expect(renderer.resize).toHaveBeenLastCalledWith(1440, 900)
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 855, behavior: 'instant' })
    flushFrame()
    expect(element('#portfolio').style.opacity).toBe('1')
    expect(document.activeElement).toBe(element('#portfolio'))
  })

  it('preserves camera progress when resizing during the entrance', async () => {
    await start()
    window.scrollTo({ top: 427.5, behavior: 'instant' })
    flushFrame()
    expect(renderer.render.mock.calls.at(-1)?.[0]).toBeCloseTo(0.5)
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
    window.dispatchEvent(new Event('resize'))
    flushFrame()
    expect(renderer.render.mock.calls.at(-1)?.[0]).toBeCloseTo(0.5)
    expect(window.scrollY).toBeCloseTo(247.5)
  })

  for (const hash of ['', '#terminal']) {
    it(`cancels pending entrance focus when history returns to ${hash || 'the initial URL'}`, async () => {
      await start()
      element('.laptop-screen').click()
      expect(timers.size).toBe(1)
      window.history.replaceState(null, '', `/${hash}`)
      window.dispatchEvent(new Event('hashchange'))
      flushTimers()
      flushFrame()
      expect(timers.size).toBe(0)
      expect(window.scrollY).toBe(0)
      expect(document.activeElement).not.toBe(element('#portfolio'))
      expect(document.documentElement.classList.contains('in-portfolio')).toBe(false)
    })
  }
})

describe('motion and graceful degradation', () => {
  it('honors a system motion preference, including live changes', async () => {
    Object.assign(media, { matches: true })
    await start()
    const toggle = element<HTMLButtonElement>('.motion-toggle')
    expect(toggle.disabled).toBe(true)
    expect(toggle.getAttribute('aria-pressed')).toBe('true')
    expect(toggle.textContent).toContain('Motion reduced')
    expect(frames.size).toBe(0)
    element('.laptop-screen').click()
    expect(window.scrollY).toBeCloseTo(495)
    expect(scrollTo.mock.calls.at(-1)?.[0]).toMatchObject({ behavior: 'instant' })
    flushTimers()
    flushFrame()
    expect(renderer.render.mock.calls.at(-1)?.[0]).toBe(0)
    expect(element('#portfolio').style.opacity).toBe('1')
    Object.assign(media, { matches: false })
    media.dispatchEvent(new Event('change'))
    expect(toggle.disabled).toBe(false)
    expect(toggle.getAttribute('aria-pressed')).toBe('false')
    flushFrame()
    expect(element('#portfolio').style.opacity).toBe('1')
    expect(window.scrollY).toBe(855)
  })

  it('pauses ambient motion, persists the choice, and resumes it on request', async () => {
    await start()
    flushFrame(100)
    const elapsed = renderer.render.mock.calls.at(-1)?.[1]
    const toggle = element<HTMLButtonElement>('.motion-toggle')
    toggle.click()
    flushFrame(200)
    expect(toggle.getAttribute('aria-pressed')).toBe('true')
    expect(window.localStorage.getItem('ryan-motion-paused')).toBe('true')
    expect(renderer.render.mock.calls.at(-1)?.[1]).toBe(elapsed)
    expect(frames.size).toBe(0)
    toggle.click()
    flushFrame(300)
    expect(window.localStorage.getItem('ryan-motion-paused')).toBe('false')
    expect(toggle.getAttribute('aria-pressed')).toBe('false')
    expect(frames.size).toBe(1)
  })

  it('starts paused when the visitor saved that preference', async () => {
    window.localStorage.setItem('ryan-motion-paused', 'true')
    await start()
    expect(element('.motion-toggle').getAttribute('aria-pressed')).toBe('true')
    expect(frames.size).toBe(0)
  })

  it('stops requesting animation while the page is hidden', async () => {
    await start()
    expect(frames.size).toBe(1)
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(frames.size).toBe(0)
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(frames.size).toBe(1)
  })

  for (const preference of ['paused', 'reduced'] as const) {
    it(`refreshes local time without advancing ${preference} ambient motion`, async () => {
      const noon = new Date(2026, 8, 7, 12, 0)
      setSystemTime(noon)
      if (preference === 'paused') window.localStorage.setItem('ryan-motion-paused', 'true')
      else Object.assign(media, { matches: true })
      await start()
      const elapsed = renderer.render.mock.calls.at(-1)?.[1]
      expect(renderer.render.mock.calls.at(-1)?.[3]).toEqual(noon)
      expect(frames.size).toBe(0)
      expect([...intervals.values()].map(({ delay }) => delay)).toEqual([60_000])

      const nextMinute = new Date(noon.getTime() + 60_000)
      setSystemTime(nextMinute)
      for (const { callback } of intervals.values()) callback()
      expect(frames.size).toBe(1)
      flushFrame(60_016)
      expect(renderer.render.mock.calls.at(-1)?.[3]).toEqual(nextMinute)
      expect(renderer.render.mock.calls.at(-1)?.[1]).toBe(elapsed)
      expect(frames.size).toBe(0)
      expect(intervals.size).toBe(1)
    })
  }

  it('suspends clock refreshes when hidden and catches up when visible', async () => {
    window.localStorage.setItem('ryan-motion-paused', 'true')
    await start()
    expect(intervals.size).toBe(1)
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(intervals.size).toBe(0)
    expect(frames.size).toBe(0)

    const evening = new Date(2026, 8, 7, 20, 0)
    setSystemTime(evening)
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    document.dispatchEvent(new Event('visibilitychange'))
    flushFrame(16)
    expect(renderer.render.mock.calls.at(-1)?.[3]).toEqual(evening)
    expect(intervals.size).toBe(1)
    expect(frames.size).toBe(0)
  })

  it('only refreshes the clock while the terminal is visible', async () => {
    window.localStorage.setItem('ryan-motion-paused', 'true')
    await start()
    element('.skip-scene').click()
    flushTimers()
    flushFrame()
    expect(intervals.size).toBe(0)
    element('.back-to-terminal').click()
    flushTimers()
    flushFrame()
    expect(intervals.size).toBe(1)
    expect(frames.size).toBe(0)
  })

  it('leaves a readable portfolio when the renderer cannot initialize', async () => {
    failRenderer = true
    await start()
    expect(document.documentElement.classList.contains('enhanced')).toBe(false)
    expect(document.documentElement.classList.contains('scene-unavailable')).toBe(true)
    expect(element('#portfolio').style.opacity).toBe('')
    expect(element('.scene-track').style.height).toBe('')
    expect(element('#portfolio').textContent).toContain('Southwest Airlines')
    expect(frames.size).toBe(0)
    expect(intervals.size).toBe(0)
  })

  it('reveals the document and releases the scene after WebGL context loss', async () => {
    await start()
    const event = new Event('webglcontextlost', { cancelable: true })
    element('canvas').dispatchEvent(event)
    flushFrame()
    expect(event.defaultPrevented).toBe(true)
    expect(renderer.dispose).toHaveBeenCalledTimes(1)
    expect(document.documentElement.classList.contains('enhanced')).toBe(false)
    expect(element('#portfolio').style.opacity).toBe('')
    expect(frames.size).toBe(0)
    expect(intervals.size).toBe(0)
  })

  for (const failure of ['render', 'resize'] as const) {
    it(`reveals content and cancels pending focus after a runtime ${failure} failure`, async () => {
      await start()
      element('.laptop-screen').click()
      if (failure === 'render') {
        failRender = true
        flushFrame()
      } else {
        failResize = true
        window.dispatchEvent(new Event('resize'))
      }
      expect(document.documentElement.classList.contains('enhanced')).toBe(false)
      expect(element('#portfolio').style.opacity).toBe('')
      expect(timers.size).toBe(0)
      expect(frames.size).toBe(0)
      expect(intervals.size).toBe(0)
      expect(renderer.dispose).toHaveBeenCalledTimes(1)
    })
  }

  it('cancels pending focus and animation work when disposed', async () => {
    await start()
    element('.laptop-screen').click()
    cleanup?.()
    cleanup = undefined
    expect(frames.size).toBe(0)
    expect(timers.size).toBe(0)
    expect(intervals.size).toBe(0)
    expect(renderer.dispose).toHaveBeenCalledTimes(1)
    const count = scrollTo.mock.calls.length
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('resize'))
    media.dispatchEvent(new Event('change'))
    expect(frames.size).toBe(0)
    expect(scrollTo).toHaveBeenCalledTimes(count)
  })
})
