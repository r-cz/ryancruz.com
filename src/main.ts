const HEX = '0123456789abcdef'

/**
 * Optional flourishes over the prerendered page: project cards glow under a
 * mouse, and the seed decodes itself on arrival. CSS owns every other
 * animation; reduced motion turns these off as well.
 */
export function initSite(): () => void {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const seed = document.querySelector<HTMLElement>('[data-seed]')
  let seedFrame = 0

  function onPointer(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || motion.matches) return
    const card = (event.target as Element | null)?.closest?.<HTMLElement>('.project')
    if (!card) return
    const rect = card.getBoundingClientRect()
    card.style.setProperty('--x', `${event.clientX - rect.left}px`)
    card.style.setProperty('--y', `${event.clientY - rect.top}px`)
  }

  // Characters lock in left to right while the rest cycle through hex digits.
  function decode() {
    if (!seed || motion.matches) return
    const value = seed.dataset.seed ?? ''
    const start = performance.now()
    window.cancelAnimationFrame(seedFrame)
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 1100, 1)
      const settled = Math.floor(progress * value.length)
      seed.textContent = [...value]
        .map((char, i) => (i < settled ? char : HEX[Math.floor(Math.random() * 16)]))
        .join('')
      seedFrame = progress < 1 ? window.requestAnimationFrame(tick) : 0
    }
    seedFrame = window.requestAnimationFrame(tick)
  }

  const observer =
    seed && typeof window.IntersectionObserver === 'function'
      ? new window.IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return
            observer?.disconnect()
            decode()
          },
          { threshold: 1 },
        )
      : undefined
  if (seed) observer?.observe(seed)
  const colophon = seed?.closest('code')

  document.addEventListener('pointermove', onPointer, { passive: true })
  colophon?.addEventListener('pointerenter', decode)
  return () => {
    observer?.disconnect()
    document.removeEventListener('pointermove', onPointer)
    colophon?.removeEventListener('pointerenter', decode)
    window.cancelAnimationFrame(seedFrame)
    if (seed) seed.textContent = seed.dataset.seed ?? ''
  }
}

if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', () => initSite(), { once: true })
else initSite()
