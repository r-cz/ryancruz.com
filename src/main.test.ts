import { afterEach, beforeEach, expect, mock, setSystemTime, spyOn, test } from 'bun:test'
import { renderPage } from './page'
import { renderTravel } from './travel'
import type { LiveScene } from './scene2d'

let assetLoad: Promise<void> | undefined
let failRender = false
let failResize = false
let failCreate = false
const renderer = {
  render: mock<LiveScene['render']>(() => {
    if (failRender) throw new Error('Render failed')
  }),
  resize: mock<LiveScene['resize']>(() => {
    if (failResize) throw new Error('Resize failed')
  }),
  dispose: mock<LiveScene['dispose']>(() => {}),
}
const createLiveScene = mock(() => {
  if (failCreate) throw new Error('Unavailable')
  return { ...renderer, ready: assetLoad }
})
function lastRender() {
  const call = renderer.render.mock.calls.at(-1)
  if (!call) throw new Error('Expected the scene to have rendered')
  return call
}
mock.module('./scene2d', () => ({ createLiveScene }))
const { initSite } = await import('./main')
document.dispatchEvent(new Event('DOMContentLoaded'))

let cleanup: (() => void) | undefined
let media: MediaQueryList
let next = 0
const frames = new Map<number, FrameRequestCallback>()
const clocks = new Map<number, () => void>()
const observers: TestObserver[] = []
const originalObserver = window.ResizeObserver
class TestObserver {
  observe = mock(() => {})
  disconnect = mock(() => {})
  constructor(public notify: () => void) {
    observers.push(this)
  }
}
function frame(time = 16) {
  const pending = [...frames.values()]
  frames.clear()
  pending.forEach((f) => f(time))
}
function size(width = 1280, height = 900) {
  Object.defineProperties(document.querySelector('.scene-viewport'), {
    clientWidth: { configurable: true, value: width },
    clientHeight: { configurable: true, value: height },
  })
}
function scroll(y: number) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y })
  window.dispatchEvent(new Event('scroll'))
}
async function start() {
  cleanup = initSite()
  await new Promise((resolve) => setTimeout(resolve, 0))
  frame()
}

beforeEach(() => {
  document.body.innerHTML = `<div id="app">${renderPage()}</div>`
  document.documentElement.className = ''
  window.history.replaceState(null, '', '/')
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 })
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  size()
  media = Object.assign(new window.EventTarget(), {
    matches: false,
    media: '(prefers-reduced-motion: reduce)',
  }) as MediaQueryList
  if (!window.matchMedia) window.matchMedia = () => media
  spyOn(window, 'matchMedia').mockImplementation(() => media)
  spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.set(++next, callback)
    return next
  })
  spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    frames.delete(id)
  })
  spyOn(window, 'setInterval').mockImplementation((callback: TimerHandler, delay?: number) => {
    expect(delay).toBe(60_000)
    clocks.set(++next, callback as () => void)
    return next
  })
  spyOn(window, 'clearInterval').mockImplementation((id) => {
    if (id) clocks.delete(id)
  })
  Object.defineProperty(window, 'ResizeObserver', { configurable: true, value: TestObserver })
  if (!HTMLElement.prototype.scrollIntoView) HTMLElement.prototype.scrollIntoView = () => {}
  spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(function (this: HTMLElement) {
    if (this.id === 'portfolio') scroll(900)
  })
  frames.clear()
  clocks.clear()
  observers.length = 0
  assetLoad = undefined
  failCreate = failRender = failResize = false
  createLiveScene.mockClear()
  renderer.render.mockClear()
  renderer.resize.mockClear()
  renderer.dispose.mockClear()
})
afterEach(() => {
  cleanup?.()
  cleanup = undefined
  mock.restore()
  setSystemTime()
  Object.defineProperty(window, 'ResizeObserver', { configurable: true, value: originalObserver })
  document.body.innerHTML = ''
  frames.clear()
  clocks.clear()
})

test('has native bag and closed laptop links, no screen, pause control or hidden portfolio', () => {
  expect(document.querySelector('.backpack-link')?.getAttribute('href')).toBe('/travel/')
  expect(document.querySelector('.macbook-link')?.getAttribute('href')).toBe('#portfolio')
  expect(document.querySelector('.laptop-screen, .motion-toggle')).toBeNull()
  expect(document.querySelector('#portfolio')?.textContent).toContain(
    'Senior Cybersecurity Engineer',
  )
  expect(document.querySelector('#portfolio')?.getAttribute('style')).toBeNull()
})
test('starts the scene without scaling, hiding content or extending the scroll track', async () => {
  await start()
  frame(1000)
  expect(document.documentElement.classList.contains('scene-ready')).toBe(true)
  expect(renderer.resize).toHaveBeenCalledWith(1280, 900)
  expect(renderer.render.mock.calls.every((call) => call[0] === 0)).toBe(true)
  expect(document.querySelector('.scene-track')?.getAttribute('style')).toBeNull()
  expect(document.querySelector('#portfolio')?.getAttribute('style')).toBeNull()
})
test('scrolling offscene stops ambient frames and the clock; returning resumes without a time jump', async () => {
  await start()
  frame(32)
  const elapsed = lastRender()[1]
  scroll(900)
  expect(frames.size).toBe(0)
  expect(clocks.size).toBe(0)
  const count = renderer.render.mock.calls.length
  scroll(1800)
  frame(100_000)
  expect(renderer.render.mock.calls.length).toBe(count)
  scroll(0)
  frame(200_000)
  expect(lastRender()[1]).toBe(elapsed)
  expect(frames.size).toBe(1)
})
test('system reduced motion freezes ambient position while the visitor clock refreshes', async () => {
  Object.defineProperty(media, 'matches', { configurable: true, value: true })
  setSystemTime(new Date(2026, 8, 13, 23, 59))
  await start()
  expect(frames.size).toBe(0)
  expect(clocks.size).toBe(1)
  const old = lastRender()
  setSystemTime(new Date(2026, 8, 14, 0, 0))
  clocks.forEach((callback) => callback())
  frame(60_000)
  const now = lastRender()
  expect(now[1]).toBe(old[1])
  expect(now[3]?.getHours()).toBe(0)
  Object.defineProperty(media, 'matches', { configurable: true, value: false })
  media.dispatchEvent(new Event('change'))
  frame(61_000)
  expect(frames.size).toBe(1)
})
test('hidden tabs suspend both schedules and resume cleanly', async () => {
  await start()
  Object.defineProperty(document, 'hidden', { configurable: true, value: true })
  document.dispatchEvent(new Event('visibilitychange'))
  expect(frames.size).toBe(0)
  expect(clocks.size).toBe(0)
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  document.dispatchEvent(new Event('visibilitychange'))
  frame(900_000)
  expect(lastRender()[1]).toBe(0)
  expect(document.documentElement.classList.contains('scene-inactive')).toBe(false)
})
test('resizing remeasures ambient routes without scrolling or manipulating the foreground', async () => {
  await start()
  scroll(500)
  size(390, 844)
  observers[0].notify()
  frame()
  expect(renderer.resize).toHaveBeenLastCalledWith(390, 844)
  expect(window.scrollY).toBe(500)
  expect(document.querySelector('.scene-foreground')?.getAttribute('style')).toBeNull()
})
test('native anchors are not intercepted and their destinations can receive keyboard focus', async () => {
  await start()
  const link = document.querySelector<HTMLAnchorElement>('.skip-scene')
  if (!link) throw new Error('Expected the skip link')
  const event = new window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
  // Cancel only at document level, after the controller, to avoid jsdom navigation.
  let intercepted = true
  document.addEventListener(
    'click',
    (e) => {
      intercepted = e.defaultPrevented
      e.preventDefault()
    },
    { once: true },
  )
  link.dispatchEvent(event)
  expect(intercepted).toBe(false)
  expect(document.querySelector<HTMLElement>('#portfolio')?.tabIndex).toBe(-1)
})
test('direct portfolio hashes align once and do not start ambient animation behind content', async () => {
  window.history.replaceState(null, '', '#portfolio')
  await start()
  expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1)
  expect(window.scrollY).toBe(900)
  expect(document.activeElement?.id).toBe('portfolio')
  expect(frames.size).toBe(0)
})
for (const failure of ['create', 'resize', 'render', 'asset'] as const) {
  test(`${failure} failure exposes prerendered portfolio and travel access`, async () => {
    if (failure === 'create') failCreate = true
    if (failure === 'resize') failResize = true
    if (failure === 'render') failRender = true
    if (failure === 'asset')
      assetLoad = Promise.resolve().then(() => {
        throw new Error('Missing artwork')
      })
    await start()
    expect(document.documentElement.classList.contains('enhanced')).toBe(false)
    expect(document.querySelector('#portfolio')?.getAttribute('style')).toBeNull()
    expect(document.querySelector('.portfolio-return a[href="/travel/"]')).not.toBeNull()
    expect(frames.size).toBe(0)
    expect(clocks.size).toBe(0)
  })
}
test('disposal during loading prevents late scene activation and removes listeners', async () => {
  let resolve!: () => void
  assetLoad = new Promise<void>((done) => {
    resolve = done
  })
  await start()
  cleanup?.()
  cleanup = undefined
  resolve()
  await Promise.resolve()
  frame()
  expect(document.documentElement.classList.contains('scene-ready')).toBe(false)
  expect(renderer.dispose).toHaveBeenCalledTimes(1)
  expect(observers[0].disconnect).toHaveBeenCalled()
  window.dispatchEvent(new Event('resize'))
  scroll(0)
  expect(frames.size).toBe(0)
  expect(clocks.size).toBe(0)
})
test('travel destination is a real static page with explicit non-clickable placeholders', () => {
  document.body.innerHTML = `<div id="app">${renderTravel()}</div>`
  cleanup = initSite()
  expect(createLiveScene).not.toHaveBeenCalled()
  expect(document.querySelector('h1')?.textContent).toBe('Travel journal.')
  expect(document.querySelectorAll('.story-status')).toHaveLength(3)
  expect(document.querySelectorAll('.travel-stories a')).toHaveLength(0)
  expect(document.querySelector('a[href="/#portfolio"]')).not.toBeNull()
})
