/**
 * Enhancements over the prerendered page. Sections reveal once as they enter
 * the viewport; a one-shot transition always finishes, unlike scroll-linked
 * animation, which Safari can leave half-finished. Project cards glow under a
 * mouse, and the email menu copies and dismisses.
 */
export function initSite(): () => void {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const email = document.querySelector<HTMLDetailsElement>('details.email')
  const copyLabel = email?.querySelector('[data-copy-label]')
  const copyText = copyLabel?.textContent ?? ''
  const revealable = [...document.querySelectorAll<HTMLElement>('.section, .reveal')]
  let copyTimer = 0

  // Elements arriving together stagger in document order.
  function reveal(elements: HTMLElement[]) {
    elements
      .sort((a, b) => (a.compareDocumentPosition(b) & a.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
      .forEach((element, i) => {
        element.style.setProperty('--n', `${i}`)
        element.classList.add('in')
      })
  }

  function onPointer(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || motion.matches) return
    const card = (event.target as Element | null)?.closest?.<HTMLElement>('.project')
    if (!card) return
    const rect = card.getBoundingClientRect()
    card.style.setProperty('--x', `${event.clientX - rect.left}px`)
    card.style.setProperty('--y', `${event.clientY - rect.top}px`)
  }

  function closeEmail(returnFocus = false) {
    if (!email?.open) return
    email.open = false
    if (returnFocus) email.querySelector('summary')?.focus()
  }
  function onDocumentClick(event: MouseEvent) {
    if (email?.open && !email.contains(event.target as Node)) closeEmail()
  }
  function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && email?.open) closeEmail(true)
  }
  async function onEmailClick(event: MouseEvent) {
    const target = event.target as Element
    if (target.closest('a.email-option')) return closeEmail()
    const button = target.closest<HTMLElement>('[data-copy]')
    if (!button || !copyLabel) return
    window.clearTimeout(copyTimer)
    try {
      await navigator.clipboard.writeText(button.dataset.copy ?? '')
      copyLabel.textContent = 'Copied'
    } catch {
      copyLabel.textContent = 'Couldn’t copy'
    }
    copyTimer = window.setTimeout(() => {
      closeEmail()
      copyLabel.textContent = copyText
    }, 1200)
  }

  const observer =
    typeof window.IntersectionObserver === 'function' && !motion.matches
      ? new window.IntersectionObserver((entries) => {
          const arrived = entries
            .filter((entry) => entry.isIntersecting)
            .map((entry) => entry.target as HTMLElement)
          arrived.forEach((element) => observer?.unobserve(element))
          reveal(arrived)
        })
      : undefined
  if (observer) revealable.forEach((element) => observer.observe(element))
  else reveal(revealable)

  document.addEventListener('pointermove', onPointer, { passive: true })
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKey)
  email?.addEventListener('click', onEmailClick)
  return () => {
    observer?.disconnect()
    document.removeEventListener('pointermove', onPointer)
    document.removeEventListener('click', onDocumentClick)
    document.removeEventListener('keydown', onKey)
    email?.removeEventListener('click', onEmailClick)
    window.clearTimeout(copyTimer)
    if (copyLabel) copyLabel.textContent = copyText
  }
}

// Without enhancement, the `js` class set in <head> would leave content hidden.
function start() {
  try {
    initSite()
  } catch {
    document.documentElement.classList.remove('js')
  }
}
if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', start, { once: true })
else start()
