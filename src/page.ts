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

const section = (id: string, title: string, body: string) => `
    <section class="section" id="${id}" aria-labelledby="${id}-title">
      <h2 class="section-title reveal" id="${id}-title">${title}</h2>
      <div class="section-body">${body}</div>
    </section>`

const entry = (years: string, title: string, org: string) => `
          <li class="entry reveal">
            <p class="meta years">${years}</p>
            <h3>${title} <span class="org">· ${org}</span></h3>
          </li>`

export function renderPage(design: Design): string {
  // Indices continue after the name so the intro rises once the letters land.
  let rise = profile.name.length
  const next = () => `style="--i:${rise++}"`
  return `
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="page">
    <header class="intro">
      <h1 class="name">${letters(profile.name)}</h1>
      <p class="role rise" ${next()}>${profile.role}</p>
      <ul class="links rise" ${next()} aria-label="Contact and profiles">
        ${profile.links.map((link) => `<li><a class="link" href="${link.href}">${link.label}${arrow}</a></li>`).join('')}
      </ul>
    </header>

    <main id="main" tabindex="-1">
      ${section(
        'projects',
        'Projects',
        `<ul class="projects">${projects
          .map(
            (project) => `
          <li class="project reveal">
            <h3><a class="project-link" href="${project.href}">${project.name}${arrow}</a></h3>
            <p class="note">${project.description}</p>
          </li>`,
          )
          .join('')}</ul>`,
      )}
      ${section(
        'experience',
        'Experience',
        `<ol class="timeline">${experience.map((job) => entry(job.years, job.role, job.org)).join('')}</ol>`,
      )}
      ${section(
        'education',
        'Education',
        `<ul class="timeline">${entry(education.years, education.degree, education.school)}</ul>`,
      )}
    </main>

    <footer class="footer reveal">
      <p class="colophon">Designed from seed <code><span class="sr-only">0x${design.seed}</span><span aria-hidden="true">0x<span data-seed="${design.seed}">${design.seed}</span></span></code></p>
    </footer>
  </div>`
}
