import { describe, expect, test } from 'bun:test'
import { SEED, deriveDesign, designCSS, random } from './design'

const seeds = Array.from({ length: 300 }, (_, i) => Math.floor(random(i + 1)() * 2 ** 32))

/** WCAG relative luminance of an `oklch(L C H)` string, via OKLab and linear sRGB. */
function luminance(color: string) {
  const [l, c, h] = color.match(/[\d.]+/g)?.map(Number) ?? []
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const lms = [
    l + 0.3963377774 * a + 0.2158037573 * b,
    l - 0.1055613458 * a - 0.0638541728 * b,
    l - 0.0894841775 * a - 1.291485548 * b,
  ].map((v) => v ** 3)
  const [r, g, bl] = [
    [4.0767416621, -3.3077115913, 0.2309699292],
    [-1.2684380046, 2.6097574011, -0.3413193965],
    [-0.0041960863, -0.7034186147, 1.707614701],
  ].map((row) => Math.min(1, Math.max(0, row[0] * lms[0] + row[1] * lms[1] + row[2] * lms[2])))
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl
}
const contrast = (x: string, y: string) => {
  const [hi, lo] = [luminance(x), luminance(y)].sort((p, q) => q - p)
  return (hi + 0.05) / (lo + 0.05)
}

describe('seeded design', () => {
  test('the same seed always grows the same design, and other seeds differ', () => {
    expect(deriveDesign(SEED)).toEqual(deriveDesign(SEED))
    expect(deriveDesign().seed).toBe((SEED >>> 0).toString(16).padStart(8, '0'))
    const variants = new Set(
      seeds.slice(0, 20).map((seed) => JSON.stringify(deriveDesign(seed).light)),
    )
    expect(variants.size).toBe(20)
  })

  test('every seed keeps text readable in light and dark schemes', () => {
    for (const seed of seeds) {
      const design = deriveDesign(seed)
      for (const p of [design.light, design.dark]) {
        expect(contrast(p.ink, p.bg)).toBeGreaterThan(12)
        // Hover cards place accent titles and muted copy on the surface tone.
        for (const fg of [p.muted, p.accent])
          for (const bg of [p.bg, p.surface]) expect(contrast(fg, bg)).toBeGreaterThan(4.5)
      }
    }
  })

  test('tokens cover both color schemes and every animation input', () => {
    const css = designCSS(deriveDesign())
    for (const token of [
      '--bg',
      '--accent2',
      '--display-family',
      '--ease',
      '--duration',
      '--stagger',
    ])
      expect(css).toContain(token)
    expect(css).toContain('@media (prefers-color-scheme:dark)')
  })
})
