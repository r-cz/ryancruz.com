import { describe, expect, test } from 'bun:test'
import { getSceneLayout, groundPosition, groundRoutes, loopPosition } from './scene-layout'

describe('ambient routes', () => {
  test('aircraft moves right and wraps only after the whole sprite leaves', () => {
    const x = (seconds: number) => loopPosition(seconds, 90, 1000, 300, 0)
    expect(x(0) + 300).toBeLessThan(0)
    expect(x(89.99)).toBeGreaterThan(1000)
    expect(x(90)).toBeCloseTo(x(0))
    expect(x(30)).toBeGreaterThan(x(15))
  })
  for (const [width, height] of [
    [1536, 1024],
    [1280, 720],
    [390, 844],
    [320, 568],
    [844, 390],
  ]) {
    test(`keeps ground traffic below the aircraft at ${width}×${height}`, () => {
      const layout = getSceneLayout(width, height)
      for (const route of groundRoutes) {
        expect(layout.vehicleGround + height * route.lane).toBeGreaterThan(layout.aircraftGround)
        expect(route.width * layout.vehicleScale).toBeLessThan(layout.aircraftWidth)
        const start = -route.phase * route.duration
        const x1 = groundPosition(route, start, layout)
        const x2 = groundPosition(route, start + route.duration - 0.00001, layout)
        const size = route.width * layout.vehicleScale
        expect(route.direction === 1 ? x1 + size < 0 : x1 > width).toBe(true)
        expect(route.direction === 1 ? x2 > width : x2 + size < 0).toBe(true)
        expect(groundPosition(route, start + route.duration, layout)).toBeCloseTo(x1)
      }
    })
  }
})
