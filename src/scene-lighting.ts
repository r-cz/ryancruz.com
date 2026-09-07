import { Color } from 'three'

interface LightingKeyframe {
  hour: number
  daylight: number
  sky: string
  hemisphere: string
  ambient: number
  sun: string
  sunlight: number
}

const night = {
  daylight: 0,
  sky: '#111d32',
  hemisphere: '#8193b8',
  ambient: 0.48,
  sun: '#afc7ed',
  sunlight: 0.11,
}

// A local-clock atmosphere, rather than an astronomical sunrise calculation.
// Matching endpoints let an open tab cross midnight without a lighting jump.
const keyframes: LightingKeyframe[] = [
  { hour: 0, ...night },
  { hour: 5, ...night },
  {
    hour: 6,
    daylight: 0.18,
    sky: '#6d7990',
    hemisphere: '#9dabca',
    ambient: 0.95,
    sun: '#ffd2a1',
    sunlight: 0.55,
  },
  {
    hour: 7,
    daylight: 0.58,
    sky: '#dbc9c0',
    hemisphere: '#e7d8d0',
    ambient: 1.7,
    sun: '#ffb878',
    sunlight: 2.4,
  },
  {
    hour: 9,
    daylight: 1,
    sky: '#dce7e9',
    hemisphere: '#eef5ff',
    ambient: 2.4,
    sun: '#fff0d9',
    sunlight: 3.2,
  },
  {
    hour: 16,
    daylight: 1,
    sky: '#dce7e9',
    hemisphere: '#eef5ff',
    ambient: 2.4,
    sun: '#fff0d9',
    sunlight: 3.2,
  },
  {
    hour: 18,
    daylight: 0.63,
    sky: '#dec4ae',
    hemisphere: '#f1d3b8',
    ambient: 1.9,
    sun: '#ffb66f',
    sunlight: 2.7,
  },
  {
    hour: 19.5,
    daylight: 0.12,
    sky: '#677691',
    hemisphere: '#a9bbdd',
    ambient: 1,
    sun: '#ffbc81',
    sunlight: 0.45,
  },
  { hour: 21, ...night },
  { hour: 24, ...night },
]

/** Read the visitor's wall clock independently of the scene's animation time. */
export function getSceneLighting(date: Date = new Date()) {
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600
  const nextIndex = keyframes.findIndex((frame) => frame.hour > hour)
  const before = keyframes[Math.max(0, nextIndex - 1)]
  const after = keyframes[nextIndex]
  const fraction = (hour - before.hour) / (after.hour - before.hour)
  const blend = fraction * fraction * (3 - 2 * fraction)
  const interpolate = (a: number, b: number) => a + (b - a) * blend
  const color = (a: string, b: string) => new Color(a).lerp(new Color(b), blend)
  const daylight = interpolate(before.daylight, after.daylight)
  const sunAngle = ((hour - 6) / 24) * Math.PI * 2

  return {
    hour,
    daylight,
    sky: color(before.sky, after.sky),
    hemisphere: color(before.hemisphere, after.hemisphere),
    ground: new Color('#715540').lerp(new Color('#99806a'), daylight),
    ambient: interpolate(before.ambient, after.ambient),
    sun: color(before.sun, after.sun),
    sunlight: interpolate(before.sunlight, after.sunlight),
    // Ceiling pools illuminate the terminal without turning the apron into daylight.
    practical: 20 + (1 - daylight) * 85,
    fill: new Color('#ffe3bc').lerp(new Color('#e6f0ff'), daylight),
    fillIntensity: 0.35 + daylight * 1.15,
    sunPosition: [-Math.cos(sunAngle) * 18, 4 + Math.max(0, Math.sin(sunAngle)) * 16, -11] as const,
  }
}
