import './components/split-flap.js'

// Configuration constants
const TITLE_CYCLING_CONFIG = {
  INITIAL_DELAY: 3000,
  FIRST_TRANSITION_DELAY: 4000,
  WAIT_AFTER_ANIMATION: 2000, // 2 seconds after animation completes
  ANIMATION_DURATION: 100,
} as const

const TITLES = [
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

// Global cleanup tracking
let titleCyclingTimeout: number | undefined
let isComponentActive = false

// Main app initialization
document.addEventListener('DOMContentLoaded', () => {
  try {
    const app = document.querySelector<HTMLDivElement>('#app')

    if (!app) {
      // App element not found
      return
    }

    app.innerHTML = `
      <div class="page-container">
        <!-- Hero Section -->
        <main class="relative z-10 flex items-center justify-center min-h-screen px-8">
          <div class="text-center max-w-4xl">
            <h1 class="text-6xl md:text-8xl font-bold mb-6 text-[var(--text-primary)]">
              RYAN CRUZ
            </h1>
            <div class="mb-8">
              <hotfx-split-flap>CYBERSECURITY ENGINEER</hotfx-split-flap>
            </div>
          </div>
        </main>
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
      // Split-flap element not found, skipping title cycling
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
        // Simple approach: Fixed timing that works for users
        // Most split-flap animations complete within 3-5 seconds regardless of content
        const fixedWaitTime = 4000 // 4 seconds - reasonable for any transition

        setTimeout(() => {
          resolve()
        }, fixedWaitTime)
      })
    }

    async function scheduleNextChange(): Promise<void> {
      // Check if component is still active and element exists
      if (!isComponentActive || !document.querySelector('hotfx-split-flap')) {
        return
      }

      const nextTitle = getRandomTitle()
      const element = document.querySelector('hotfx-split-flap') as HTMLElement
      if (!element || !isComponentActive) {
        return
      }

      // Set the new title
      element.textContent = nextTitle

      // Wait for the animation to complete
      await waitForAnimationComplete()

      // Wait additional time before next transition
      titleCyclingTimeout = window.setTimeout(() => {
        if (isComponentActive) {
          scheduleNextChange()
        }
      }, TITLE_CYCLING_CONFIG.WAIT_AFTER_ANIMATION)
    }

    // Start the first transition after configured delay

    titleCyclingTimeout = window.setTimeout(async () => {
      // Check if still active
      if (!isComponentActive) return

      // First transition happens after configured delay
      const firstTitle = getRandomTitle()
      const element = document.querySelector('hotfx-split-flap') as HTMLElement
      if (!element) return

      element.textContent = firstTitle

      // Wait for the first animation to complete
      await waitForAnimationComplete()

      // Now start the continuous cycling
      titleCyclingTimeout = window.setTimeout(() => {
        if (isComponentActive) {
          scheduleNextChange()
        }
      }, TITLE_CYCLING_CONFIG.WAIT_AFTER_ANIMATION)
    }, TITLE_CYCLING_CONFIG.FIRST_TRANSITION_DELAY)
  } catch {
    // Failed to initialize title cycling
    isComponentActive = false
  }
}
