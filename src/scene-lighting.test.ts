import { describe, expect, test } from 'bun:test'
import { getSceneLighting, mixColor } from './scene-lighting'
const at = (hour: number, minute = 0, second = 0) => new Date(2026, 8, 7, hour, minute, second)

describe('visitor clock atmosphere', () => {
  test('uses local time independently of animation, with warm dusk and lit nights', () => {
    const date = at(12)
    date.getUTCHours = () => 0
    const noon = getSceneLighting(date)
    const night = getSceneLighting(at(0))
    const dusk = getSceneLighting(at(18))
    expect(noon.hour).toBe(12)
    expect(noon.daylight).toBe(1)
    expect(noon.night).toBe(0)
    expect(night.night).toBe(1)
    expect(night.exteriorBrightness).toBeLessThan(night.interiorBrightness)
    expect(dusk.sunset).toBeGreaterThan(noon.sunset)
    expect(dusk.daylight).toBeGreaterThan(0)
    expect(dusk.daylight).toBeLessThan(1)
    expect(noon.sky).toMatch(/^#[0-9a-f]{6}$/)
  })
  test('keeps every palette boundary and midnight continuous', () => {
    for (const minute of [0, 300, 360, 420, 540, 960, 1080, 1170, 1260]) {
      const before = getSceneLighting(at(0, minute, -1))
      const after = getSceneLighting(at(0, minute, 1))
      for (const key of [
        'daylight',
        'night',
        'sunset',
        'exteriorBrightness',
        'interiorBrightness',
      ] as const)
        expect(Math.abs(after[key] - before[key])).toBeLessThan(0.001)
      for (const offset of [1, 3, 5])
        expect(
          Math.abs(
            parseInt(before.sky.slice(offset, offset + 2), 16) -
              parseInt(after.sky.slice(offset, offset + 2), 16),
          ),
        ).toBeLessThanOrEqual(1)
    }
  })
  test('interpolates plain CSS colors without a graphics dependency', () => {
    expect(mixColor('#000000', '#ffffff', 0.5)).toBe('#808080')
    expect(mixColor('#102030', '#405060', 0)).toBe('#102030')
    expect(mixColor('#102030', '#405060', 1)).toBe('#405060')
  })
})
