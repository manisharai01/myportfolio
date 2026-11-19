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

export function scrollToTarget(target, opts = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (lenis) {
    lenis.scrollTo(el ?? 0, { duration: 1.6, ...opts })
    return
  }
  if (el) el.scrollIntoView({ behavior: 'smooth' })
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}

export const stopScroll = () => lenis?.stop()
export const startScroll = () => lenis?.start()
