import './style.css'
import './components/split-flap.js'

// Configuration constants
const TITLE_CYCLING_CONFIG = {
  INITIAL_DELAY: 3000,
  FIRST_TRANSITION_DELAY: 4000,
  DYNAMIC_CYCLE_GAP: 1000,
  ANIMATION_DURATION: 100,
  TIME_PER_CHANGED_CHAR: 500,
  BASE_DISPLAY_TIME: 3000
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
      console.error('App element not found')
      return
    }
    
    app.innerHTML = `
      <div class="relative min-h-screen">
        <!-- Airport Diagram Background -->
        <div 
          id="airport-bg" 
          class="fixed inset-0 pointer-events-none airport-background"
          style="
            background-image: url('/kdal.svg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: var(--airport-diagram-opacity);
          "
        ></div>
        
        <!-- Gradient Overlay -->
        <div class="fixed inset-0 pointer-events-none gradient-overlay"></div>
        
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
    
    // Initialize components
    initGradientOverlay()
    
    // Initialize title cycling after a delay
    setTimeout(() => {
      initTitleCycling()
    }, TITLE_CYCLING_CONFIG.INITIAL_DELAY)
    
  } catch (error) {
    console.error('Failed to initialize app:', error)
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

function initGradientOverlay() {
  try {
    const overlay = document.querySelector('.gradient-overlay') as HTMLElement
    if (!overlay) return
    
    // Create radial gradient that fades from center to edges
    overlay.style.background = `
      radial-gradient(
        ellipse at center,
        transparent 20%,
        var(--bg-primary) 80%
      )
    `
  } catch (error) {
    console.error('Failed to initialize gradient overlay:', error)
  }
}

function initTitleCycling() {
  try {
    const titleElement = document.querySelector('hotfx-split-flap') as HTMLElement
    if (!titleElement) {
      console.warn('Split-flap element not found, skipping title cycling')
      return
    }
    
    isComponentActive = true
    
    // Configure component for optimal performance
    titleElement.setAttribute('duration', TITLE_CYCLING_CONFIG.ANIMATION_DURATION.toString())
    
    let usedTitles: string[] = []
    let currentTitle = 'CYBERSECURITY ENGINEER'
    
    function getRandomTitle(): string {
      // If we've used all titles, reset the list
      if (usedTitles.length === TITLES.length) {
        usedTitles = []
      }
      
      // Get available titles
      const availableTitles = TITLES.filter(title => !usedTitles.includes(title))
      
      // Pick a random one
      const randomIndex = Math.floor(Math.random() * availableTitles.length)
      const selectedTitle = availableTitles[randomIndex]
      
      // Mark as used
      usedTitles.push(selectedTitle)
      
      return selectedTitle
    }
    
    function calculateTransitionTime(fromTitle: string, toTitle: string): number {
      const maxLength = Math.max(fromTitle.length, toTitle.length)
      let changedCharacters = 0
      
      for (let i = 0; i < maxLength; i++) {
        const fromChar = fromTitle[i] || ' '
        const toChar = toTitle[i] || ' '
        
        if (fromChar !== toChar) {
          changedCharacters++
        }
      }
      
      // Calculate estimated time based on character changes
      return (changedCharacters * TITLE_CYCLING_CONFIG.TIME_PER_CHANGED_CHAR) + 
             TITLE_CYCLING_CONFIG.BASE_DISPLAY_TIME
    }
    
    function scheduleNextChange(): void {
      // Check if component is still active and element exists
      if (!isComponentActive || !document.querySelector('hotfx-split-flap')) {
        return
      }
      
      const nextTitle = getRandomTitle()
      const transitionTime = calculateTransitionTime(currentTitle, nextTitle)
      
      titleCyclingTimeout = window.setTimeout(() => {
        // Double-check element still exists before updating
        const element = document.querySelector('hotfx-split-flap') as HTMLElement
        if (!element || !isComponentActive) {
          return
        }
        
        element.textContent = nextTitle
        currentTitle = nextTitle
        
        // Schedule the next change
        scheduleNextChange()
      }, transitionTime)
    }
    
    // Start the first transition sooner, then use dynamic timing
    titleCyclingTimeout = window.setTimeout(() => {
      // Check if still active
      if (!isComponentActive) return
      
      // First transition happens after configured delay
      const firstTitle = getRandomTitle()
      const element = document.querySelector('hotfx-split-flap') as HTMLElement
      if (!element) return
      
      element.textContent = firstTitle
      currentTitle = firstTitle
      
      // Now start the dynamic scheduling
      titleCyclingTimeout = window.setTimeout(() => {
        if (isComponentActive) {
          scheduleNextChange()
        }
      }, TITLE_CYCLING_CONFIG.DYNAMIC_CYCLE_GAP)
      
    }, TITLE_CYCLING_CONFIG.FIRST_TRANSITION_DELAY)
    
  } catch (error) {
    console.error('Failed to initialize title cycling:', error)
    isComponentActive = false
  }
}