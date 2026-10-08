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
const { initSite } = await import('./main')

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
  for (const item of [profile.role, ...profile.about, education.degree])
    expect(text).toContain(item)
  for (const job of experience) expect(text).toContain(job.org)
  for (const link of profile.links)
    expect(document.querySelector(`.links a[href="${link.href}"]`)?.textContent).toBe(link.label)
  for (const project of projects) {
    expect(document.querySelector(`.project-link[href="${project.href}"]`)?.textContent).toBe(
      project.name,
    )
  }
  expect(document.querySelector('a[href="https://iam-tools.racruz7.workers.dev"]')).not.toBeNull()
  expect(document.querySelectorAll('.figure path')).toHaveLength(2)
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

test('a mouse leans the figure and lights the card under it; touch does neither', () => {
  cleanup = initSite()
  const figure = document.querySelector<HTMLElement>('.figure')
  const card = document.querySelector<HTMLElement>('.project')
  if (!figure || !card) throw new Error('Expected the figure and a project card')
  pointer(card, 100, 50, 'touch')
  expect(frames.size).toBe(0)
  expect(card.style.getPropertyValue('--x')).toBe('')
  pointer(card, 1000, 0)
  expect(card.style.getPropertyValue('--x')).toBe('1000px')
  for (let i = 0; i < 400 && frames.size; i++) frame(i * 16)
  expect(figure.style.getPropertyValue('--tilt-x')).toBe('9.00deg')
  expect(figure.style.getPropertyValue('--tilt-y')).toBe('9.00deg')
})

test('reduced motion leaves the seed and figure still', () => {
  reduced = true
  cleanup = initSite()
  intersect?.([{ isIntersecting: true }])
  pointer(document.body, 900, 100)
  expect(frames.size).toBe(0)
  expect(seed()?.textContent).toBe(design.seed)
  expect(document.querySelector<HTMLElement>('.figure')?.style.getPropertyValue('--tilt-x')).toBe(
    '',
  )
})

test('cleanup stops listening and restores the seed mid-decode', () => {
  cleanup = initSite()
  intersect?.([{ isIntersecting: true }])
  frame(300)
  cleanup()
  cleanup = undefined
  expect(seed()?.textContent).toBe(design.seed)
  pointer(document.querySelector('.project') ?? document.body, 500, 400)
  expect(frames.size).toBe(0)
})
