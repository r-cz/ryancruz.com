import { JSDOM } from 'jsdom'

// Set up jsdom for DOM testing
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
})

// Make DOM globals available
global.document = dom.window.document
global.window = dom.window as any
global.navigator = dom.window.navigator
global.HTMLElement = dom.window.HTMLElement
global.Event = dom.window.Event