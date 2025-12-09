import './components/split-flap.js'

// Configuration constants
const TITLE_CYCLING_CONFIG = {
  INITIAL_DELAY: 3000,
  FIRST_TRANSITION_DELAY: 4000,
  WAIT_AFTER_ANIMATION: 2000,
  ANIMATION_DURATION: 100,
} as const

const TITLES = [
  'CYBERSECURITY ENGINEER',
  'IDENTITY ENTHUSIAST',
  'NONREV TRAVELER',
  'PARK LOVER',
  'CINEPHILE',
  'HOMELABBER',
  'GEORGIAN',
  'TEXAN',
  'FOODIE',
  'HIKER',
] as const

// Social links configuration
const SOCIAL_LINKS = [
  {
    name: 'GitHub',
    url: 'https://github.com/r-cz',
    icon: `<svg class="nav-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/cruzryan',
    icon: `<svg class="nav-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
  },
  {
    name: 'Resume',
    url: '/Resume.pdf',
    icon: `<svg class="nav-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  },
] as const

// Global cleanup tracking
let titleCyclingTimeout: number | undefined
let isComponentActive = false

// Main app initialization
document.addEventListener('DOMContentLoaded', () => {
  try {
    const app = document.querySelector<HTMLDivElement>('#app')

    if (!app) {
      return
    }

    // Generate social links HTML
    const socialLinksHTML = SOCIAL_LINKS.map(
      (link) => `
        <a href="${link.url}" class="nav-link" ${link.url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>
          ${link.icon}
          <span>${link.name}</span>
        </a>
      `
    ).join('')

    app.innerHTML = `
      <div class="page-container">
        <main class="hero-section">
          <div class="hero-content">
            <!-- Name -->
            <h1 class="hero-name">
              <span>RYAN CRUZ</span>
            </h1>

            <!-- Split flap subtitle -->
            <div class="hero-subtitle">
              <div class="split-flap-wrapper">
                <hotfx-split-flap>CYBERSECURITY ENGINEER</hotfx-split-flap>
              </div>
            </div>

            <!-- Social links -->
            <nav class="nav-links">
              ${socialLinksHTML}
            </nav>
          </div>
        </main>

        <!-- Footer coordinates -->
        <footer class="footer-info">
          <span><span class="coord-symbol">KDAL</span> Dallas Love Field</span>
          <span><span class="coord-symbol">32.8N</span> <span class="coord-symbol">96.9W</span></span>
        </footer>
      </div>
    `

    // Initialize title cycling after a delay
    setTimeout(() => {
      initTitleCycling()
    }, TITLE_CYCLING_CONFIG.INITIAL_DELAY)
  } catch {
    // Failed to initialize app
  }
})

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  cleanup()
})

// Cleanup on visibility change (when user switches tabs)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cleanup()
  } else if (!isComponentActive) {
    // Restart if component was stopped
    setTimeout(() => {
      initTitleCycling()
    }, TITLE_CYCLING_CONFIG.INITIAL_DELAY)
  }
})

function cleanup() {
  if (titleCyclingTimeout) {
    clearTimeout(titleCyclingTimeout)
    titleCyclingTimeout = undefined
  }
  isComponentActive = false
}

function initTitleCycling() {
  try {
    // Respect reduced motion: disable cycling
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      isComponentActive = false
      return
    }

    const titleElement = document.querySelector('hotfx-split-flap') as HTMLElement
    if (!titleElement) {
      return
    }

    isComponentActive = true

    // Configure component for optimal performance
    titleElement.setAttribute('duration', TITLE_CYCLING_CONFIG.ANIMATION_DURATION.toString())

    let usedTitles: string[] = []

    function getRandomTitle(): string {
      // If we've used all titles, reset the list
      if (usedTitles.length === TITLES.length) {
        usedTitles = []
      }

      // Get available titles
      const availableTitles = TITLES.filter((title) => !usedTitles.includes(title))

      // Pick a random one
      const randomIndex = Math.floor(Math.random() * availableTitles.length)
      const selectedTitle = availableTitles[randomIndex]

      // Mark as used
      usedTitles.push(selectedTitle)

      return selectedTitle
    }

    function waitForAnimationComplete(): Promise<void> {
      return new Promise((resolve) => {
        const fixedWaitTime = 4000
        setTimeout(() => {
          resolve()
        }, fixedWaitTime)
      })
    }

    async function scheduleNextChange(): Promise<void> {
      if (!isComponentActive || !document.querySelector('hotfx-split-flap')) {
        return
      }

      const nextTitle = getRandomTitle()
      const element = document.querySelector('hotfx-split-flap') as HTMLElement
      if (!element || !isComponentActive) {
        return
      }

      element.textContent = nextTitle

      await waitForAnimationComplete()

      titleCyclingTimeout = window.setTimeout(() => {
        if (isComponentActive) {
          scheduleNextChange()
        }
      }, TITLE_CYCLING_CONFIG.WAIT_AFTER_ANIMATION)
    }

    titleCyclingTimeout = window.setTimeout(async () => {
      if (!isComponentActive) return

      const firstTitle = getRandomTitle()
      const element = document.querySelector('hotfx-split-flap') as HTMLElement
      if (!element) return

      element.textContent = firstTitle

      await waitForAnimationComplete()

      titleCyclingTimeout = window.setTimeout(() => {
        if (isComponentActive) {
          scheduleNextChange()
        }
      }, TITLE_CYCLING_CONFIG.WAIT_AFTER_ANIMATION)
    }, TITLE_CYCLING_CONFIG.FIRST_TRANSITION_DELAY)
  } catch {
    isComponentActive = false
  }
}
