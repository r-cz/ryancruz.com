const HEX = '0123456789abcdef'

/**
 * Optional flourishes over the prerendered page: the figure leans toward a
 * mouse, project cards glow under it, and the seed decodes itself on arrival.
 * CSS owns every other animation; reduced motion turns these off as well.
 */
export function initSite(): () => void {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const figure = document.querySelector<HTMLElement>('.figure')
  const seed = document.querySelector<HTMLElement>('[data-seed]')
  const target = { x: 0, y: 0 }
  const tilt = { x: 0, y: 0 }
  let tiltFrame = 0
  let seedFrame = 0

  // Ease toward the pointer each frame, landing exactly on it once close.
  function lean() {
    const settled = Math.abs(target.x - tilt.x) + Math.abs(target.y - tilt.y) < 0.02
    tilt.x = settled ? target.x : tilt.x + (target.x - tilt.x) * 0.08
    tilt.y = settled ? target.y : tilt.y + (target.y - tilt.y) * 0.08
    figure?.style.setProperty('--tilt-x', `${tilt.x.toFixed(2)}deg`)
    figure?.style.setProperty('--tilt-y', `${tilt.y.toFixed(2)}deg`)
    tiltFrame = settled ? 0 : window.requestAnimationFrame(lean)
  }

  function onPointer(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || motion.matches) return
    const card = (event.target as Element | null)?.closest?.<HTMLElement>('.project')
    if (card) {
      const rect = card.getBoundingClientRect()
      card.style.setProperty('--x', `${event.clientX - rect.left}px`)
      card.style.setProperty('--y', `${event.clientY - rect.top}px`)
    }
    if (!figure) return
    target.x = (event.clientX / window.innerWidth - 0.5) * 18
    target.y = (0.5 - event.clientY / window.innerHeight) * 18
    if (!tiltFrame) tiltFrame = window.requestAnimationFrame(lean)
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
    window.cancelAnimationFrame(tiltFrame)
    window.cancelAnimationFrame(seedFrame)
    if (seed) seed.textContent = seed.dataset.seed ?? ''
  }
}

if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', () => initSite(), { once: true })
else initSite()
