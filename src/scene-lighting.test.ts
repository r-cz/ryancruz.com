import { describe, expect, test } from 'bun:test'
import { getSceneLighting } from './scene-lighting'

function at(hour: number, minute = 0, second = 0) {
  return new Date(2026, 8, 7, hour, minute, second)
}

describe('visitor clock lighting', () => {
  test('uses local time, with a bright apron at noon and lit interiors at night', () => {
    const date = at(12)
    // Make the two clocks disagree regardless of the test runner's time zone.
    date.getUTCHours = () => 0
    const noon = getSceneLighting(date)
    const night = getSceneLighting(at(0))
    expect(noon.hour).toBe(12)
    expect(noon.daylight).toBe(1)
    expect(night.daylight).toBe(0)
    expect(noon.sunlight).toBeGreaterThan(night.sunlight * 10)
    expect(noon.ambient).toBeGreaterThan(night.ambient)
    expect(night.practical).toBeGreaterThan(noon.practical)
    expect(night.fill.r).toBeGreaterThan(night.fill.b)
  })

  test('moves sunlight across the windows and warms the evening', () => {
    const morning = getSceneLighting(at(8))
    const noon = getSceneLighting(at(12))
    const evening = getSceneLighting(at(18))
    expect(morning.sunPosition[0]).toBeLessThan(0)
    expect(evening.sunPosition[0]).toBeGreaterThan(0)
    expect(noon.sunPosition[1]).toBeGreaterThan(evening.sunPosition[1])
    expect(evening.sun.b / evening.sun.r).toBeLessThan(noon.sun.b / noon.sun.r)
    expect(evening.daylight).toBeGreaterThan(0)
    expect(evening.daylight).toBeLessThan(1)
  })

  test('keeps every palette transition and midnight continuous', () => {
    for (const minute of [0, 300, 360, 420, 540, 960, 1080, 1170, 1260]) {
      const before = getSceneLighting(at(0, minute, -1))
      const after = getSceneLighting(at(0, minute, 1))
      for (const key of [
        'daylight',
        'ambient',
        'sunlight',
        'practical',
        'fillIntensity',
      ] as const) {
        expect(Math.abs(after[key] - before[key])).toBeLessThan(0.001)
      }
      for (const key of ['sky', 'hemisphere', 'ground', 'sun', 'fill'] as const) {
        for (const channel of ['r', 'g', 'b'] as const) {
          expect(Math.abs(after[key][channel] - before[key][channel])).toBeLessThan(0.001)
        }
      }
    }
  })
})
