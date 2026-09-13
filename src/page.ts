import { renderPortfolio } from './portfolio'
import { assetURL, sprite } from './scene-art'

export const arrow =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>'

/** Native links and prerendered content remain usable without the scene. */
export function renderPage(): string {
  return `
    <a class="keyboard-skip" href="#portfolio">Skip to portfolio</a>
    <section class="scene-track" id="terminal" aria-label="A moment at Dallas Love Field">
      <div class="scene-viewport">
        <div class="scene-camera" aria-hidden="true"><div class="scene-loading">Taking a seat at Love Field…</div></div>
        <header class="scene-header"><a class="scene-monogram" href="#terminal" aria-label="Ryan Cruz, terminal home">RC.</a><a class="skip-scene" href="#portfolio">Skip to portfolio ${arrow}</a></header>
        <div class="scene-foreground">
          ${sprite('foreground-seats')}
          <a class="scene-object backpack-link" href="/travel/" aria-label="Open Ryan’s travel journal">
            <img src="${assetURL('backpack')}" alt="Black Patagonia Mini MLC backpack resting on a seat" draggable="false" />
            <span class="object-label">Travel journal ${arrow}</span>
          </a>
          <a class="scene-object macbook-link" href="#portfolio" aria-label="Open Ryan Cruz’s portfolio">
            <img src="${assetURL('closed-macbook')}" alt="Closed silver MacBook Pro resting on a seat" draggable="false" />
            <span class="object-label">Portfolio ${arrow}</span>
          </a>
        </div>
        <p class="scene-caption">A moment between departures.</p>
      </div>
    </section>
    <main class="portfolio" id="portfolio" tabindex="-1">${renderPortfolio()}
      <nav class="portfolio-return" aria-label="More from Ryan"><a href="#terminal">Back to the terminal ${arrow}</a><a href="/travel/">Travel journal ${arrow}</a></nav>
    </main>
  `
}
