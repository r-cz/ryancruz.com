import { arrow } from './page'
import { renderSceneArt } from './scene-art'

/** A real, prerendered destination with clearly unpublished story placeholders. */
export function renderTravel(): string {
  return `<a class="keyboard-skip" href="#travel">Skip to travel journal</a>
    <div class="travel-page">
      <header class="travel-header"><a class="travel-monogram" href="/#terminal" aria-label="Ryan Cruz, terminal home">RC.</a><nav aria-label="Main navigation"><a href="/#portfolio">Portfolio ${arrow}</a><a href="/#terminal">Back to the terminal</a></nav></header>
      <main id="travel" tabindex="-1">
        <div class="travel-intro"><h1>Travel journal.</h1><p>Notes from the places in between.</p></div>
        <div class="travel-illustration" role="img" aria-label="An illustrated view of the Dallas skyline through a window at Love Field">${renderSceneArt({ ambient: false, seating: false })}</div>
        <section class="travel-stories" aria-labelledby="stories-title"><h2 id="stories-title">Stories to come</h2>
          <ol>${['A place worth getting lost in', 'A few notes from the journey', 'What made it into the bag'].map((title, i) => `<li><span class="story-number">0${i + 1}</span><h3>${title}</h3><span class="story-status">Coming soon</span></li>`).join('')}</ol>
          <p class="travel-note">A few empty pages, ready for the next trip.</p>
        </section>
      </main>
      <footer class="travel-footer"><span>Ryan Cruz</span><a href="/#terminal">Back to the terminal ${arrow}</a></footer>
    </div>`
}
