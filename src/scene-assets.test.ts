import { afterEach, beforeEach, expect, mock, spyOn, test } from 'bun:test'
import { loadSceneArtwork } from './scene-assets'

const originalImage = window.Image
const images: TestImage[] = []
const timeouts = new Map<number, () => void>()
let nextTimeout = 0
class TestImage {
  src = ''
  complete = false
  naturalWidth = 100
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor() {
    images.push(this)
  }
}
const optional = (image: TestImage) => /\/(aircraft|clouds)\.webp/.test(image.src)

beforeEach(() => {
  images.length = 0
  timeouts.clear()
  Object.defineProperty(window, 'Image', { configurable: true, value: TestImage })
  spyOn(window, 'setTimeout').mockImplementation((callback: TimerHandler, delay?: number) => {
    expect(delay).toBe(12_000)
    timeouts.set(++nextTimeout, callback as () => void)
    return nextTimeout
  })
  spyOn(window, 'clearTimeout').mockImplementation((id) => {
    if (id) timeouts.delete(id)
  })
})
afterEach(() => {
  mock.restore()
  Object.defineProperty(window, 'Image', { configurable: true, value: originalImage })
})

test('starts once essential layers load even when ambient sprites are still pending', async () => {
  const failed = mock(() => {})
  const artwork = loadSceneArtwork(failed)
  images.filter((image) => !optional(image)).forEach((image) => image.onload?.())
  await artwork.ready
  expect(timeouts.size).toBe(2)
  images.filter(optional).forEach((image) => image.onerror?.())
  expect(failed.mock.calls).toEqual([['aircraft'], ['clouds']])
  expect(timeouts.size).toBe(0)
  artwork.dispose()
})

test('rejects essential failure so the controller can reveal the HTML portfolio', async () => {
  const artwork = loadSceneArtwork(() => {})
  images.find((image) => image.src.includes('/terminal.webp'))?.onerror?.()
  await expect(artwork.ready).rejects.toThrow('Scene artwork unavailable: terminal')
  artwork.dispose()
  expect(timeouts.size).toBe(0)
})

test('bounds stalled artwork requests and releases their handlers', async () => {
  const artwork = loadSceneArtwork(() => {})
  ;[...timeouts.values()].forEach((timeout) => timeout())
  await expect(artwork.ready).rejects.toThrow('Scene artwork unavailable')
  expect(timeouts.size).toBe(0)
  expect(images.every((image) => image.onload === null && image.onerror === null)).toBe(true)
})

test('disposal settles pending loads and ignores late completion or failure', async () => {
  const failed = mock(() => {})
  const artwork = loadSceneArtwork(failed)
  const lateCallbacks = images.flatMap((image) => [image.onload, image.onerror])
  artwork.dispose()
  artwork.dispose()
  lateCallbacks.forEach((callback) => callback?.())
  await artwork.ready
  expect(failed).not.toHaveBeenCalled()
  expect(timeouts.size).toBe(0)
  expect(images.every((image) => image.onload === null && image.onerror === null)).toBe(true)
})
