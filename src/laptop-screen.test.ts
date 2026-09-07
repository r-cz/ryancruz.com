import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { JSDOM } from 'jsdom'
import * as THREE from 'three'
import { createLaptopScreenTexture } from './laptop-screen'

const cleanup: (() => void)[] = []

function fixture() {
  // Keep these browser mocks local so other scene tests retain their own DOM.
  const dom = new JSDOM(`
    <a class="laptop-screen">
      <div class="screen-masthead"><span>ALEX RIVERA</span><span>WORK &amp; CONTACT</span></div>
      <span class="screen-name">Alex Rivera.</span>
      <span class="screen-role">Platform Engineer</span>
      <span class="screen-description">I build dependable systems.<br>Based in Austin.</span>
      <span class="screen-cta">Explore my work <svg aria-hidden="true"></svg></span>
    </a>
  `)
  const element = dom.window.document.querySelector<HTMLElement>('.laptop-screen')
  if (!element) throw new Error('Missing laptop screen fixture')
  const painted: { text: string; font: string }[] = []
  const context = {
    font: '',
    setTransform() {},
    fillRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    fillText(text: string) {
      painted.push({ text, font: this.font })
    },
    measureText: (text: string) => ({ width: text.length * 6 }),
  } as unknown as CanvasRenderingContext2D
  const getContext = spyOn(dom.window.HTMLCanvasElement.prototype, 'getContext')
  getContext.mockReturnValue(context)
  let resolveFonts: () => void = () => {}
  const ready = new Promise<void>((resolve) => {
    resolveFonts = resolve
  })
  Object.defineProperty(dom.window.document, 'fonts', { value: { ready } })
  cleanup.push(() => {
    getContext.mockRestore()
    dom.window.close()
  })
  return { element, painted, ready, resolveFonts, getContext }
}

function start(element: HTMLElement, onChange = () => {}) {
  const screen = createLaptopScreenTexture(element, onChange)
  cleanup.push(() => screen.dispose())
  return screen
}

afterEach(() => {
  cleanup
    .splice(0)
    .reverse()
    .forEach((dispose) => dispose())
})

describe('laptop screen preview', () => {
  it('requests a frame with the updated texture when fonts finish in a paused scene', async () => {
    const { element, ready, resolveFonts } = fixture()
    const renderedVersions: number[] = []
    const onChange = mock(() => renderedVersions.push(screen.texture.version))
    const screen = start(element, onChange)
    const initialVersion = screen.texture.version
    expect(onChange).not.toHaveBeenCalled()

    // No animation tick or update method runs between the initial frame and
    // font completion: this callback is what wakes a paused/reduced-motion scene.
    resolveFonts()
    await ready
    expect(screen.texture.version).toBe(initialVersion + 1)
    expect(renderedVersions).toEqual([initialVersion + 1])
    await Promise.resolve()
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('ignores late font completion and releases the texture only once after teardown', async () => {
    const { element, painted, ready, resolveFonts } = fixture()
    const onChange = mock(() => {})
    const screen = start(element, onChange)
    const onDispose = mock(() => {})
    screen.texture.addEventListener('dispose', onDispose)
    const initialVersion = screen.texture.version
    const initialPaintCount = painted.length

    screen.dispose()
    screen.dispose()
    resolveFonts()
    await ready

    expect(onDispose).toHaveBeenCalledTimes(1)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.texture.version).toBe(initialVersion)
    expect(painted).toHaveLength(initialPaintCount)
  })

  it('can dispose a fully loaded preview without requesting another frame', async () => {
    const { element, ready, resolveFonts } = fixture()
    const onChange = mock(() => {})
    const screen = start(element, onChange)
    resolveFonts()
    await ready
    const onDispose = mock(() => {})
    screen.texture.addEventListener('dispose', onDispose)

    screen.dispose()
    screen.dispose()

    expect(onDispose).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('draws the supplied portfolio copy, preserving line breaks and the source DOM', () => {
    const { element, painted } = fixture()
    const originalMarkup = element.innerHTML
    const screen = start(element)
    const strings = painted.map(({ text }) => text)

    expect(strings).toContain('ALEX RIVERA')
    expect(strings).toContain('WORK & CONTACT')
    expect(strings).toContain('Platform Engineer')
    expect(strings).toContain('I build dependable systems.')
    expect(strings).toContain('Based in Austin.')
    expect(strings).toContain('Explore my work')
    // The large headline is individually tracked, so reconstruct its text.
    expect(
      painted
        .filter(({ font }) => font.startsWith('78px '))
        .map(({ text }) => text)
        .join(''),
    ).toBe('Alex Rivera.')
    expect(element.innerHTML).toBe(originalMarkup)
    expect(screen.texture.colorSpace).toBe(THREE.SRGBColorSpace)
  })

  it('propagates a missing canvas context to the scene fallback', () => {
    const { element, getContext } = fixture()
    getContext.mockReturnValue(null)
    const onChange = mock(() => {})
    expect(() => start(element, onChange)).toThrow('requires a canvas context')
    expect(onChange).not.toHaveBeenCalled()
  })
})
