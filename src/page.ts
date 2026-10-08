import { education, experience, profile, projects } from './content'

const arrowIcon =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>'
/** Two stacked arrows let hover swap one out to the top right and the next in from the bottom left. */
export const arrow = `<span class="arrow" aria-hidden="true">${arrowIcon}${arrowIcon}</span>`
const chevron =
  '<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>'

/** A native disclosure, so the menu opens without JavaScript; main.ts adds copying and dismissal. */
const emailMenu = (address: string) => `<li>
          <details class="email">
            <summary class="link">Email${chevron}</summary>
            <div class="email-menu">
              <button class="email-option" type="button" data-copy="${address}"><span data-copy-label aria-live="polite">Copy email address</span><span class="email-address">${address}</span></button>
              <a class="email-option" href="mailto:${address}">Send an email</a>
            </div>
          </details>
        </li>`

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

export function renderPage(): string {
  return `
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="page">
    <header class="intro">
      <h1 class="name">${profile.name}</h1>
      <p class="role">${profile.role}</p>
      <ul class="links" aria-label="Contact and profiles">
        ${profile.links.map((link) => `<li><a class="link" href="${link.href}">${link.label}${arrow}</a></li>`).join('')}
        ${emailMenu(profile.email)}
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
  </div>`
}
