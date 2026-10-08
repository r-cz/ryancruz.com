import { education, experience, profile, projects } from './content'
import type { Design } from './design'

const arrowIcon =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>'
/** Two stacked arrows let hover swap one out to the top right and the next in from the bottom left. */
export const arrow = `<span class="arrow" aria-hidden="true">${arrowIcon}${arrowIcon}</span>`

function letters(text: string) {
  let i = 0
  const words = text
    .split(' ')
    .map(
      (word) =>
        `<span class="word">${[...word].map((char) => `<span style="--i:${i++}">${char}</span>`).join('')}</span>`,
    )
  return `<span class="sr-only">${text}</span><span class="letters" aria-hidden="true">${words.join(' ')}</span>`
}

function figure(design: Design) {
  return `<div class="figure" aria-hidden="true">
    <svg viewBox="-104 -104 208 208" focusable="false">
      <defs><linearGradient id="figure-ink" x1="-100" y1="-100" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:var(--accent)"/><stop offset="1" style="stop-color:var(--accent2)"/></linearGradient></defs>
      <g class="figure-spin">
        <path class="figure-trace" d="${design.figure}" pathLength="1"/>
        <path class="figure-glint" d="${design.figure}" pathLength="1"/>
      </g>
    </svg>
  </div>`
}

const section = (id: string, title: string, body: string) => `
    <section class="section" id="${id}" aria-labelledby="${id}-title">
      <h2 class="section-title reveal" id="${id}-title">${title}</h2>
      <div class="section-body">${body}</div>
    </section>`

export function renderPage(design: Design): string {
  // Indices continue after the name so the intro rises once the letters land.
  let rise = profile.name.length
  const next = () => `style="--i:${rise++}"`
  return `
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="page">
    <header class="intro">
      ${figure(design)}
      <div class="intro-copy">
        <h1 class="name">${letters(profile.name)}</h1>
        <p class="role rise" ${next()}>${profile.role}</p>
        <p class="lede rise" ${next()}>${profile.lede}</p>
        <ul class="links rise" ${next()} aria-label="Contact and profiles">
          ${profile.links.map((link) => `<li><a class="link" href="${link.href}">${link.label}${arrow}</a></li>`).join('')}
        </ul>
      </div>
    </header>

    <main id="main" tabindex="-1">
      ${section('about', 'About', profile.about.map((p) => `<p class="prose reveal">${p}</p>`).join(''))}
      ${section(
        'projects',
        'Projects',
        `<ul class="projects">${projects
          .map(
            (project) => `
          <li class="project reveal">
            <p class="meta">${project.kind}</p>
            <h3><a class="project-link" href="${project.href}">${project.name}${arrow}</a></h3>
            <p class="prose">${project.description}</p>
            ${project.live ? `<a class="link small" href="${project.live}">Open the app${arrow}</a>` : ''}
          </li>`,
          )
          .join('')}</ul>`,
      )}
      ${section(
        'experience',
        'Experience',
        `<ol class="timeline">${experience
          .map(
            (job) => `
          <li class="entry reveal">
            <p class="meta years">${job.years}</p>
            <div><h3>${job.role} <span class="org">· ${job.org}</span></h3><p class="note">${job.note}</p></div>
          </li>`,
          )
          .join('')}</ol>`,
      )}
      ${section(
        'education',
        'Education',
        `<div class="entry reveal">
          <p class="meta years">${education.years}</p>
          <div><h3>${education.degree} <span class="org">· ${education.school}</span></h3><p class="note">${education.note}</p></div>
        </div>`,
      )}
    </main>

    <footer class="footer reveal">
      <p>${profile.name} · Dallas, Texas</p>
      <p class="colophon">Palette, type, curve and motion generated from seed <code><span class="sr-only">0x${design.seed}</span><span aria-hidden="true">0x<span data-seed="${design.seed}">${design.seed}</span></span></code></p>
    </footer>
  </div>`
}
