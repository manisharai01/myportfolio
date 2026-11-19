import Lenis from 'lenis'

let lenis = null
let rafId = 0

export function initLenis() {
  if (lenis) return lenis
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: !reduce,
    touchMultiplier: 1.4,
  })
  const raf = (time) => {
    lenis?.raf(time)
    rafId = requestAnimationFrame(raf)
  }
  rafId = requestAnimationFrame(raf)
  return lenis
}

export function destroyLenis() {
  cancelAnimationFrame(rafId)
  lenis?.destroy()
  lenis = null
}

export const getLenis = () => lenis

/**
 * Document Y of an element's in-flow position. Sticky ancestors (the stacking
 * work cards) report wherever they're currently stuck, so measure with them
 * briefly un-stuck — synchronous, so nothing ever paints in that state.
 */
export function staticTop(el) {
  const stuck = []
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    if (getComputedStyle(n).position === 'sticky') {
      stuck.push([n, n.style.position])
      n.style.position = 'static'
    }
  }
  // measure the (untransformed) sticky wrapper itself — the card inside may be scaled down
  const anchor = stuck.length ? stuck[0][0] : el
  const top = anchor.getBoundingClientRect().top + window.scrollY
  stuck.forEach(([n, v]) => (n.style.position = v))
  return top
}

export function scrollToTarget(target, opts = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  const y = el ? staticTop(el) : 0
  if (lenis) {
    lenis.scrollTo(y, { duration: 1.6, ...opts })
    return
  }
  window.scrollTo({ top: y, behavior: 'smooth' })
}

export const stopScroll = () => lenis?.stop()
export const startScroll = () => lenis?.start()
