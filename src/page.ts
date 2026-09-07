import { renderPortfolio } from './portfolio'

const arrow =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>'
const chevron =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>'

/** Shared by the build and browser: the portfolio never depends on JavaScript. */
export function renderPage(): string {
  return `
    <a class="keyboard-skip" href="#portfolio">Skip to portfolio</a>
    <section class="scene-track" id="terminal" aria-label="A moment at Dallas Love Field">
      <div class="scene-viewport">
        <div class="scene-camera" aria-label="An interactive view inside Dallas Love Field">
          <div class="scene-loading">Taking a seat at Love Field…</div>
        </div>
        <div class="scene-surfaces">
            <a class="laptop-screen" href="#portfolio" aria-label="Open Ryan Cruz’s portfolio">
              <div class="screen-masthead" aria-hidden="true"><span>RYAN CRUZ</span><span>ABOUT &nbsp; EXPERIENCE &nbsp; PROJECTS</span></div>
              <div class="screen-intro" aria-hidden="true">
                <span class="screen-name">Ryan Cruz.</span>
                <span class="screen-role">Senior Cybersecurity Engineer</span>
                <span class="screen-description">I build identity and access solutions at Southwest Airlines.<br>Based in Dallas. Usually thinking about what’s next.</span>
                <span class="screen-cta">Get to know me ${arrow}</span>
              </div>
            </a>
        </div>
        <header class="scene-header scene-chrome"><a class="scene-monogram" href="#terminal" aria-label="Ryan Cruz, terminal home">RC.</a><a class="skip-scene" href="#portfolio">Skip to portfolio ${arrow}</a></header>
        <div class="scene-footer scene-chrome">
          <a class="explore-cue" href="#portfolio" aria-label="Explore the portfolio"><span>Click the laptop or scroll to explore</span>${chevron}</a>
        </div>
      </div>
    </section>
    <main class="portfolio" id="portfolio" tabindex="-1">${renderPortfolio()}</main>
    <div class="experience-controls">
      <a class="back-to-terminal" href="#terminal">${chevron}<span>Back to the terminal</span></a>
      <button class="motion-toggle" type="button" aria-pressed="false" aria-label="Pause ambient motion"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path class="pause-icon" d="M7 5v10M13 5v10"/><path class="play-icon" d="m7 5 8 5-8 5Z"/></svg><span>Pause motion</span></button>
    </div>
  `
}
