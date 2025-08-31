import { describe, it, expect, beforeEach } from 'bun:test'
import './main'

describe('main.ts', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>'
  })

  it('should initialize app without errors when app element exists', () => {
    const app = document.querySelector('#app')
    expect(app).toBeTruthy()

    // Trigger DOMContentLoaded event
    const event = new Event('DOMContentLoaded')
    document.dispatchEvent(event)

    // Check if app content was added
    expect(app?.innerHTML).toContain('RYAN CRUZ')
    expect(app?.innerHTML).toContain('CYBERSECURITY ENGINEER')
  })

  it('should handle missing app element gracefully', () => {
    document.body.innerHTML = '' // Remove app element

    // Trigger DOMContentLoaded event
    const event = new Event('DOMContentLoaded')
    document.dispatchEvent(event)

    // Should not throw and not create #app
    expect(document.querySelector('#app')).toBeNull()
  })
})
