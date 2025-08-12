import './style.css'
import './components/split-flap.js'

// Configuration constants
const TITLE_CYCLING_CONFIG = {
  INITIAL_DELAY: 3000,
  FIRST_TRANSITION_DELAY: 4000,
  WAIT_AFTER_ANIMATION: 2000, // 2 seconds after animation completes
  ANIMATION_DURATION: 100
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
    
    function waitForAnimationComplete(): Promise<void> {
      return new Promise((resolve) => {
        console.log(`[${new Date().toISOString()}] Waiting for animation to complete...`)
        
        // Simple approach: Fixed timing that works for users
        // Most split-flap animations complete within 3-5 seconds regardless of content
        const fixedWaitTime = 4000 // 4 seconds - reasonable for any transition
        
        console.log(`[${new Date().toISOString()}] Using fixed wait time: ${fixedWaitTime}ms`)
        
        setTimeout(() => {
          console.log(`[${new Date().toISOString()}] Animation completed!`)
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
      
      console.log(`[${new Date().toISOString()}] Starting transition to: "${nextTitle}"`)
      
      // Set the new title
      element.textContent = nextTitle
      
      // Wait for the animation to complete
      await waitForAnimationComplete()
      
      console.log(`[${new Date().toISOString()}] Starting ${TITLE_CYCLING_CONFIG.WAIT_AFTER_ANIMATION}ms delay before next transition`)
      
      // Wait additional time before next transition
      titleCyclingTimeout = window.setTimeout(() => {
        if (isComponentActive) {
          console.log(`[${new Date().toISOString()}] Delay complete, scheduling next change`)
          scheduleNextChange()
        }
      }, TITLE_CYCLING_CONFIG.WAIT_AFTER_ANIMATION)
    }
    
    // Start the first transition after configured delay
    console.log(`[${new Date().toISOString()}] Title cycling initialized, first transition in ${TITLE_CYCLING_CONFIG.FIRST_TRANSITION_DELAY}ms`)
    
    titleCyclingTimeout = window.setTimeout(async () => {
      // Check if still active
      if (!isComponentActive) return
      
      // First transition happens after configured delay
      const firstTitle = getRandomTitle()
      const element = document.querySelector('hotfx-split-flap') as HTMLElement
      if (!element) return
      
      console.log(`[${new Date().toISOString()}] Starting first transition to: "${firstTitle}"`)
      element.textContent = firstTitle
      
      // Wait for the first animation to complete
      await waitForAnimationComplete()
      
      console.log(`[${new Date().toISOString()}] First animation complete, starting continuous cycling with ${TITLE_CYCLING_CONFIG.WAIT_AFTER_ANIMATION}ms delay`)
      
      // Now start the continuous cycling
      titleCyclingTimeout = window.setTimeout(() => {
        if (isComponentActive) {
          console.log(`[${new Date().toISOString()}] Initial delay complete, starting continuous cycling`)
          scheduleNextChange()
        }
      }, TITLE_CYCLING_CONFIG.WAIT_AFTER_ANIMATION)
      
    }, TITLE_CYCLING_CONFIG.FIRST_TRANSITION_DELAY)
    
  } catch (error) {
    console.error('Failed to initialize title cycling:', error)
    isComponentActive = false
  }
}