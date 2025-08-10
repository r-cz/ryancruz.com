import './style.css'
import './components/split-flap.js'

// Main app initialization
document.addEventListener('DOMContentLoaded', () => {
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
  
  // Initialize gradient overlay
  initGradientOverlay()
  
  // Initialize title cycling after a delay
  setTimeout(() => {
    initTitleCycling()
  }, 3000) // Wait 3 seconds for initial animation
})

function initGradientOverlay() {
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
}

function initTitleCycling() {
  const titleElement = document.querySelector('hotfx-split-flap') as HTMLElement
  if (!titleElement) return
  
  // Set a faster duration for smoother transitions
  titleElement.setAttribute('duration', '100')
  
  const titles = [
    'IDENTITY ENTHUSIAST',
    'NONREV TRAVELER', 
    'PARK LOVER',
    'CINEPHILE',
    'HOMELABBER',
    'GEORGIAN',
    'TEXAN',
    'PENNSYLVANIAN'
  ]
  
  let usedTitles: string[] = []
  let currentTitle = 'CYBERSECURITY ENGINEER'
  
  function getRandomTitle(): string {
    // If we've used all titles, reset the list
    if (usedTitles.length === titles.length) {
      usedTitles = []
    }
    
    // Get available titles
    const availableTitles = titles.filter(title => !usedTitles.includes(title))
    
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
    
    // More conservative: estimate ~500ms per changed character + 3s display time
    const estimatedTime = (changedCharacters * 500) + 3000
    return estimatedTime
  }
  
  function scheduleNextChange() {
    const nextTitle = getRandomTitle()
    const transitionTime = calculateTransitionTime(currentTitle, nextTitle)
    
    setTimeout(() => {
      titleElement.textContent = nextTitle
      currentTitle = nextTitle
      
      // Schedule the next change
      scheduleNextChange()
    }, transitionTime)
  }
  
  // Start the first transition sooner, then use dynamic timing
  setTimeout(() => {
    // First transition happens after just 4 seconds total
    const firstTitle = getRandomTitle()
    titleElement.textContent = firstTitle
    currentTitle = firstTitle
    
    // Now start the dynamic scheduling
    setTimeout(() => {
      scheduleNextChange()
    }, 1000) // Small gap before starting dynamic cycle
    
  }, 4000) // First change after 4 seconds instead of waiting for full calculation
}