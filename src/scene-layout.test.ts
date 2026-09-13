import { describe, expect, test } from 'bun:test'
import { getSceneLayout, loopPosition, sceneTransform } from './scene-layout'

describe('illustrated scene composition', () => {
  for (const [width, height] of [
    [1536, 1024],
    [1280, 720],
    [390, 844],
    [320, 568],
    [844, 390],
  ]) {
    test(`keeps the laptop, screen and aircraft clear at ${width}×${height}`, () => {
      const { laptop, screen, aircraftGround } = getSceneLayout(width, height)
      expect(laptop.y).toBeGreaterThan(aircraftGround)
      expect(laptop.x).toBeGreaterThanOrEqual(0)
      expect(laptop.x + laptop.width).toBeLessThanOrEqual(width)
      expect(laptop.y + laptop.height).toBeLessThan(height * 0.92)
      expect(screen.x).toBeGreaterThan(laptop.x)
      expect(screen.x + screen.width).toBeLessThan(laptop.x + laptop.width)
      expect(screen.y + screen.height).toBeLessThan(laptop.y + laptop.height)
    })
  }
  test('moves right and wraps only after the full plane leaves the viewport', () => {
    const x = (seconds: number) => loopPosition(seconds, 90, 1000, 300, 0)
    expect(x(0) + 300).toBeLessThan(0)
    expect(x(89.99)).toBeGreaterThan(1000)
    expect(x(90)).toBeCloseTo(x(0))
    expect(x(30)).toBeGreaterThan(x(15))
  })
  test('centers the enlarged HTML screen with the same transform as its shell', () => {
    const layout = getSceneLayout(1536, 1024)
    expect(sceneTransform(layout, 0)).toBe('translate(0px, 0px) scale(1)')
    expect(sceneTransform(layout, -1)).toBe(sceneTransform(layout, 0))
    expect(sceneTransform(layout, 2)).toBe(sceneTransform(layout, 1))
    const expectedY = layout.height / 2 - (layout.screen.y + layout.screen.height / 2)
    expect(sceneTransform(layout, 1)).toContain(`${expectedY}px)`)
  })
})
