/**
 * Every visual decision on the page is derived from one seed, rolled once with
 * crypto.getRandomValues. Replace SEED to redesign the site.
 */
export const SEED = 0xcc0fe108

export type Display = 'sans' | 'serif' | 'mono'

interface Palette {
  bg: string
  surface: string
  ink: string
  muted: string
  line: string
  accent: string
  accent2: string
}

export interface Design {
  hue: number
  display: Display
  ratio: number
  ease: string
  duration: number
  stagger: number
  light: Palette
  dark: Palette
}

/** mulberry32: small, fast and good enough for design decisions. */
export function random(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const round = (value: number, digits = 3) => Number(value.toFixed(digits))
const oklch = (l: number, c: number, h: number) => `oklch(${round(l)} ${round(c)} ${round(h, 1)})`

export function deriveDesign(seed = SEED): Design {
  const rand = random(seed)
  const hue = rand() * 360
  const chroma = 0.11 + rand() * 0.07
  const hue2 = (hue + (rand() < 0.5 ? -1 : 1) * (40 + rand() * 80) + 360) % 360
  const tint = 0.004 + rand() * 0.008
  const display = (['sans', 'serif', 'mono'] as const)[Math.floor(rand() * 3)]
  const ratio = 1.18 + rand() * 0.15
  const ease = `cubic-bezier(${round(0.12 + rand() * 0.23, 2)}, ${round(0.55 + rand() * 0.45, 2)}, ${round(0.1 + rand() * 0.3, 2)}, 1)`
  const duration = Math.round(700 + rand() * 400)
  const stagger = Math.round(45 + rand() * 45)
  return {
    hue: round(hue, 1),
    display,
    ratio: round(ratio),
    ease,
    duration,
    stagger,
    light: {
      bg: oklch(0.985, tint, hue),
      surface: oklch(0.962, tint * 1.6, hue),
      ink: oklch(0.23, 0.02, hue),
      muted: oklch(0.5, 0.02, hue),
      line: oklch(0.9, 0.012, hue),
      accent: oklch(0.48, chroma, hue),
      accent2: oklch(0.62, chroma, hue2),
    },
    dark: {
      bg: oklch(0.17, tint * 1.6, hue),
      surface: oklch(0.21, tint * 2, hue),
      ink: oklch(0.94, 0.01, hue),
      muted: oklch(0.72, 0.015, hue),
      line: oklch(0.3, 0.015, hue),
      accent: oklch(0.79, chroma * 0.85, hue),
      accent2: oklch(0.74, chroma, hue2),
    },
  }
}

const fonts: Record<Display, { family: string; tracking: string; weight: number }> = {
  sans: { family: "'Inter', system-ui, sans-serif", tracking: '-0.055em', weight: 600 },
  serif: {
    family: "ui-serif, 'New York', 'Iowan Old Style', Georgia, serif",
    tracking: '-0.035em',
    weight: 400,
  },
  mono: { family: "'JetBrains Mono', ui-monospace, monospace", tracking: '-0.07em', weight: 500 },
}

/** Custom properties for the prerendered <style> block; style.css consumes them. */
export function designCSS(design: Design): string {
  const palette = (p: Palette) =>
    Object.entries(p)
      .map(([name, value]) => `--${name}:${value};`)
      .join('')
  const font = fonts[design.display]
  return [
    `:root{${palette(design.light)}--display-family:${font.family};--display-tracking:${font.tracking};--display-weight:${font.weight};--ratio:${design.ratio};--ease:${design.ease};--duration:${design.duration}ms;--stagger:${design.stagger}ms}`,
    `@media (prefers-color-scheme:dark){:root{${palette(design.dark)}}}`,
  ].join('')
}
