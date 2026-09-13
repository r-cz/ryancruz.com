interface AtmosphereKeyframe {
  hour: number
  daylight: number
  sunset: number
  sky: string
}

const night = { daylight: 0, sunset: 0, sky: '#11243f' }
const keyframes: AtmosphereKeyframe[] = [
  { hour: 0, ...night },
  { hour: 5, ...night },
  { hour: 6, daylight: 0.18, sunset: 0.45, sky: '#70829d' },
  { hour: 7, daylight: 0.58, sunset: 0.65, sky: '#d3c4bb' },
  { hour: 9, daylight: 1, sunset: 0, sky: '#8bcef0' },
  { hour: 16, daylight: 1, sunset: 0, sky: '#8bcef0' },
  { hour: 18, daylight: 0.63, sunset: 0.8, sky: '#dcb99b' },
  { hour: 19.5, daylight: 0.12, sunset: 0.4, sky: '#63738c' },
  { hour: 21, ...night },
  { hour: 24, ...night },
]

export function mixColor(a: string, b: string, amount: number) {
  const channels = [1, 3, 5].map((offset) => {
    const first = parseInt(a.slice(offset, offset + 2), 16)
    const last = parseInt(b.slice(offset, offset + 2), 16)
    return Math.round(first + (last - first) * amount)
      .toString(16)
      .padStart(2, '0')
  })
  return `#${channels.join('')}`
}

/** Visitor wall time is independent of elapsed animation time and motion preferences. */
export function getSceneLighting(date: Date = new Date()) {
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600
  const next = keyframes.findIndex((frame) => frame.hour > hour)
  const before = keyframes[Math.max(0, next - 1)]
  const after = keyframes[next]
  const fraction = (hour - before.hour) / (after.hour - before.hour)
  const blend = fraction * fraction * (3 - 2 * fraction)
  const daylight = before.daylight + (after.daylight - before.daylight) * blend
  const sunset = before.sunset + (after.sunset - before.sunset) * blend
  return {
    hour,
    daylight,
    sunset,
    night: 1 - daylight,
    sky: mixColor(before.sky, after.sky, blend),
    exteriorBrightness: 0.33 + daylight * 0.67,
    interiorBrightness: 0.78 + daylight * 0.22,
  }
}
