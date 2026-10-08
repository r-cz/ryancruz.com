import { afterEach, beforeEach, expect, mock, spyOn, test } from 'bun:test'
import { education, experience, profile, projects } from './content'
import { deriveDesign } from './design'
import { renderPage } from './page'

const design = deriveDesign()
let reduced = false
let intersect: ((entries: { isIntersecting: boolean }[]) => void) | undefined
const frames = new Map<number, FrameRequestCallback>()
let next = 0
let now = 0

window.matchMedia = (() => ({ matches: reduced })) as unknown as typeof window.matchMedia
// Defer the module's own start-up so each test controls initSite itself.
Object.defineProperty(document, 'readyState', { configurable: true, value: 'loading' })
const { initSite } = await import('./main')
Object.defineProperty(document, 'readyState', { configurable: true, value: 'complete' })

class TestObserver {
  constructor(callback: typeof intersect) {
    intersect = callback
  }
  observe() {}
  disconnect() {}
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
const seed = () => document.querySelector<HTMLElement>('[data-seed]')

let cleanup: (() => void) | undefined
beforeEach(() => {
  document.body.innerHTML = renderPage(design)
  reduced = false
  intersect = undefined
  frames.clear()
  now = 0
  Object.defineProperty(window, 'IntersectionObserver', { configurable: true, value: TestObserver })
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1000 })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
  spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.set(++next, callback)
    return next
  })
  spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => void frames.delete(id))
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
  expect(document.querySelector('h1 .sr-only')?.textContent).toBe(profile.name)
  expect(document.querySelector('h1 .letters')?.getAttribute('aria-hidden')).toBe('true')
  for (const item of [profile.role, education.degree, education.school])
    expect(text).toContain(item)
  for (const job of experience) expect(text).toContain(`${job.role} · ${job.org}`)
  for (const link of profile.links)
    expect(document.querySelector(`.links a[href="${link.href}"]`)?.textContent).toBe(link.label)
  for (const project of projects) {
    const link = document.querySelector(`.project-link[href="${project.href}"]`)
    expect(link?.textContent).toBe(project.name)
    expect(link?.closest('.project')?.textContent).toContain(project.description)
  }
  expect(document.querySelector('.project-link[href="https://martenldap.com"]')).not.toBeNull()
  expect(document.querySelector('svg path[d^="M-"], .figure')).toBeNull()
  expect(seed()?.textContent).toBe(design.seed)
})

test('the seed decodes left to right once it scrolls into view', () => {
  cleanup = initSite()
  expect(seed()?.textContent).toBe(design.seed)
  intersect?.([{ isIntersecting: true }])
  frame(550)
  const halfway = seed()?.textContent ?? ''
  expect(halfway).toHaveLength(8)
  expect(halfway.slice(0, 4)).toBe(design.seed.slice(0, 4))
  frame(1100)
  expect(seed()?.textContent).toBe(design.seed)
  expect(frames.size).toBe(0)
})

test('a mouse lights the card under it; touch does not', () => {
  cleanup = initSite()
  const card = document.querySelector<HTMLElement>('.project')
  if (!card) throw new Error('Expected a project card')
  pointer(card, 100, 50, 'touch')
  expect(card.style.getPropertyValue('--x')).toBe('')
  pointer(card, 120, 40)
  expect(card.style.getPropertyValue('--x')).toBe('120px')
  expect(card.style.getPropertyValue('--y')).toBe('40px')
})

test('reduced motion leaves the seed and cards still', () => {
  reduced = true
  cleanup = initSite()
  intersect?.([{ isIntersecting: true }])
  const card = document.querySelector<HTMLElement>('.project')
  if (!card) throw new Error('Expected a project card')
  pointer(card, 120, 40)
  expect(frames.size).toBe(0)
  expect(seed()?.textContent).toBe(design.seed)
  expect(card.style.getPropertyValue('--x')).toBe('')
})

test('cleanup stops listening and restores the seed mid-decode', () => {
  cleanup = initSite()
  intersect?.([{ isIntersecting: true }])
  frame(300)
  cleanup()
  cleanup = undefined
  expect(seed()?.textContent).toBe(design.seed)
  seed()?.closest('code')?.dispatchEvent(new window.Event('pointerenter'))
  expect(frames.size).toBe(0)
  const card = document.querySelector<HTMLElement>('.project')
  if (card) pointer(card, 120, 40)
  expect(card?.style.getPropertyValue('--x')).toBe('')
})
