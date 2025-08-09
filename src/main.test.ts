import { describe, it, expect, beforeEach, vi } from 'vitest'
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
    expect(app?.innerHTML).toContain('Ryan Cruz')
    expect(app?.innerHTML).toContain('Cybersecurity Engineer')
  })

  it('should handle missing app element gracefully', () => {
    document.body.innerHTML = '' // Remove app element
    
    // Mock console.error to capture the error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Trigger DOMContentLoaded event
    const event = new Event('DOMContentLoaded')
    document.dispatchEvent(event)
    
    // Should log error when app element is missing
    expect(consoleSpy).toHaveBeenCalledWith('App element not found')
    
    consoleSpy.mockRestore()
  })
})