import { afterEach, beforeEach, expect, mock, spyOn, test } from 'bun:test'
import { education, experience, profile, projects } from './content'
import { deriveDesign } from './design'
import { renderPage } from './page'

const design = deriveDesign()
let reduced = false
const observers: TestObserver[] = []
const observer = () => observers.at(-1)
const frames = new Map<number, FrameRequestCallback>()
const timers: (() => void)[] = []
let next = 0
let now = 0

window.matchMedia = (() => ({ matches: reduced })) as unknown as typeof window.matchMedia
// Defer the module's own start-up so each test controls initSite itself.
Object.defineProperty(document, 'readyState', { configurable: true, value: 'loading' })
const { initSite } = await import('./main')
Object.defineProperty(document, 'readyState', { configurable: true, value: 'complete' })

type Callback = (entries: { isIntersecting: boolean; target: Element }[]) => void
class TestObserver {
  observed = new Set<Element>()
  constructor(public callback: Callback) {
    observers.push(this)
  }
  observe(element: Element) {
    this.observed.add(element)
  }
  unobserve(element: Element) {
    this.observed.delete(element)
  }
  disconnect() {
    this.observed.clear()
  }
  /** Reports the given observed elements as on screen. */
  arrive(...elements: Element[]) {
    this.callback(elements.map((target) => ({ isIntersecting: true, target })))
  }
}
function frame(time: number) {
  now = time
  const pending = [...frames.values()]
  frames.clear()
  pending.forEach((callback) => callback(time))
}
function pointer(target: Element, x: number, y: number, pointerType = 'mouse') {
  const event = new window.MouseEvent('pointermove', { bubbles: true, clientX: x, clientY: y })
  target.dispatchEvent(Object.assign(event, { pointerType }))
}
const $ = <T extends Element = HTMLElement>(selector: string) => {
  const element = document.querySelector<T>(selector)
  if (!element) throw new Error(`Expected ${selector}`)
  return element
}
const seed = () => $('[data-seed]')
const click = (target: Element) =>
  target.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

let cleanup: (() => void) | undefined
beforeEach(() => {
  document.body.innerHTML = renderPage(design)
  reduced = false
  observers.length = 0
  frames.clear()
  timers.length = 0
  now = 0
  Object.defineProperty(window, 'IntersectionObserver', { configurable: true, value: TestObserver })
  spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.set(++next, callback)
    return next
  })
  spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => void frames.delete(id))
  spyOn(window, 'setTimeout').mockImplementation(((callback: () => void) => {
    timers.push(callback)
    return timers.length
  }) as unknown as typeof window.setTimeout)
  spyOn(performance, 'now').mockImplementation(() => now)
})
afterEach(() => {
  cleanup?.()
  cleanup = undefined
  mock.restore()
  document.body.innerHTML = ''
})

test('prerenders every detail and project as plain, readable HTML', () => {
  const text = document.body.textContent ?? ''
  expect($('h1 .sr-only').textContent).toBe(profile.name)
  expect($('h1 .letters').getAttribute('aria-hidden')).toBe('true')
  expect($('.role').textContent).toBe('Identity engineer')
  for (const item of [education.degree, education.school]) expect(text).toContain(item)
  for (const job of experience) expect(text).toContain(`${job.role} · ${job.org}`)
  for (const project of projects) {
    const link = $(`.project-link[href="${project.href}"]`)
    expect(link.textContent).toBe(project.name)
    expect(link.closest('.project')?.textContent).toContain(project.description)
  }
  expect(seed().textContent).toBe(design.seed)
})

test('email comes last as a menu to copy the address or open a mail app', () => {
  const items = [...document.querySelectorAll('.links > li')]
  expect(items.map((item) => item.textContent?.trim().split(/\s/)[0])).toEqual([
    ...profile.links.map((link) => link.label),
    'Email',
  ])
  expect($('details.email summary').textContent).toBe('Email')
  expect($('[data-copy]').dataset.copy).toBe(profile.email)
  expect($('a.email-option').getAttribute('href')).toBe(`mailto:${profile.email}`)
})

test('copying confirms, then the menu closes and resets', async () => {
  const writeText = mock(() => Promise.resolve())
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  cleanup = initSite()
  const email = $<HTMLDetailsElement>('details.email')
  email.open = true
  click($('[data-copy] span'))
  await settle()
  expect(writeText).toHaveBeenCalledWith(profile.email)
  expect($('[data-copy-label]').textContent).toBe('Copied')
  expect(email.open).toBe(true)
  timers.forEach((run) => run())
  expect(email.open).toBe(false)
  expect($('[data-copy-label]').textContent).toBe('Copy email address')
})

test('a blocked clipboard says so instead of claiming success', async () => {
  const writeText = mock(() => Promise.reject(new Error('Denied')))
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  cleanup = initSite()
  $<HTMLDetailsElement>('details.email').open = true
  click($('[data-copy]'))
  await settle()
  expect($('[data-copy-label]').textContent).toBe('Couldn’t copy')
})

test('the menu closes on Escape, returning focus, and on clicks outside it', () => {
  cleanup = initSite()
  const email = $<HTMLDetailsElement>('details.email')
  email.open = true
  click($('.email-menu'))
  expect(email.open).toBe(true)
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }))
  expect(email.open).toBe(false)
  expect(document.activeElement).toBe($('details.email summary'))
  email.open = true
  click($('main'))
  expect(email.open).toBe(false)
})

test('sections reveal once on arrival and stay revealed', () => {
  cleanup = initSite()
  const section = $('#experience')
  const entries = [...section.querySelectorAll<HTMLElement>('.reveal')]
  expect(section.classList.contains('in')).toBe(false)
  expect(observer()?.observed.has(section)).toBe(true)
  observer()?.arrive(...[...entries].reverse(), section)
  expect([section, ...entries].every((el) => el.classList.contains('in'))).toBe(true)
  // Arrivals stagger in document order, whatever order they are reported in.
  expect([section, ...entries].map((el) => el.style.getPropertyValue('--n'))).toEqual(
    [section, ...entries].map((_, i) => `${i}`),
  )
  expect(observer()?.observed.has(section)).toBe(false)
})

test('the seed decodes left to right once it scrolls into view', () => {
  cleanup = initSite()
  observer()?.arrive(seed())
  frame(550)
  const halfway = seed().textContent ?? ''
  expect(halfway).toHaveLength(8)
  expect(halfway.slice(0, 4)).toBe(design.seed.slice(0, 4))
  frame(1100)
  expect(seed().textContent).toBe(design.seed)
  expect(frames.size).toBe(0)
})

test('a mouse lights the card under it; touch does not', () => {
  cleanup = initSite()
  const card = $('.project')
  pointer(card, 100, 50, 'touch')
  expect(card.style.getPropertyValue('--x')).toBe('')
  pointer(card, 120, 40)
  expect(card.style.getPropertyValue('--x')).toBe('120px')
  expect(card.style.getPropertyValue('--y')).toBe('40px')
})

test('reduced motion shows everything at once and keeps the seed and cards still', () => {
  reduced = true
  cleanup = initSite()
  expect(observer()).toBeUndefined()
  expect(
    [...document.querySelectorAll('.reveal, .section')].every((el) => el.classList.contains('in')),
  ).toBe(true)
  pointer($('.project'), 120, 40)
  expect(frames.size).toBe(0)
  expect(seed().textContent).toBe(design.seed)
  expect($('.project').style.getPropertyValue('--x')).toBe('')
})

test('without IntersectionObserver, content is revealed rather than left hidden', () => {
  Object.defineProperty(window, 'IntersectionObserver', { configurable: true, value: undefined })
  cleanup = initSite()
  expect(
    [...document.querySelectorAll('.reveal, .section')].every((el) => el.classList.contains('in')),
  ).toBe(true)
})

test('cleanup stops listening and restores the seed mid-decode', () => {
  cleanup = initSite()
  observer()?.arrive(seed())
  frame(300)
  cleanup()
  cleanup = undefined
  expect(seed().textContent).toBe(design.seed)
  seed().closest('code')?.dispatchEvent(new window.Event('pointerenter'))
  expect(frames.size).toBe(0)
  pointer($('.project'), 120, 40)
  expect($('.project').style.getPropertyValue('--x')).toBe('')
  const email = $<HTMLDetailsElement>('details.email')
  email.open = true
  click($('main'))
  expect(email.open).toBe(true)
})
