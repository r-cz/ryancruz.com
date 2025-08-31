import { JSDOM } from 'jsdom'

// Set up jsdom for DOM testing
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable',
})

// Make DOM globals available
global.document = dom.window.document
global.window = dom.window as any
global.navigator = dom.window.navigator
global.HTMLElement = dom.window.HTMLElement
global.Event = dom.window.Event

// Minimal stubs for browser APIs not provided by jsdom
if (!(global as any).customElements) {
  ;(global as any).customElements = {
    define: () => {},
    get: () => undefined,
  }
}

if (!(global as any).IntersectionObserver) {
  ;(global as any).IntersectionObserver = class {
    constructor(_: any) {}
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any
}
