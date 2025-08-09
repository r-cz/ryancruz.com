// src/main.ts
document.addEventListener("DOMContentLoaded", () => {
  const app = document.querySelector("#app");
  if (!app) {
    console.error("App element not found");
    return;
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
            Ryan Cruz
          </h1>
          <p class="text-xl md:text-2xl text-[var(--text-secondary)] mb-8">
            Cybersecurity Engineer
          </p>
          <div class="inline-block px-8 py-4 bg-airport-yellow text-black font-semibold rounded-lg hover:bg-opacity-90 transition-all cursor-pointer">
            Welcome Aboard
          </div>
        </div>
      </main>
    </div>
  `;
  initGradientOverlay();
});
function initGradientOverlay() {
  const overlay = document.querySelector(".gradient-overlay");
  if (!overlay)
    return;
  overlay.style.background = `
    radial-gradient(
      ellipse at center,
      transparent 20%,
      var(--bg-primary) 80%
    )
  `;
}
