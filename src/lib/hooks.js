import { useEffect, useState, useSyncExternalStore } from 'react'

export function useMedia(query) {
  const subscribe = (cb) => {
    const m = window.matchMedia(query)
    m.addEventListener('change', cb)
    return () => m.removeEventListener('change', cb)
  }
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}

export const useFinePointer = () => useMedia('(hover: hover) and (pointer: fine)')
export const useReducedMotionPref = () => useMedia('(prefers-reduced-motion: reduce)')

const fmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

/** Live wall-clock time in Gurugram (IST). */
export function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return fmt.format(now)
}

/** Calls fn while the element is on screen (and the tab is visible). */
export function useVisible(ref, margin = '0px') {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin])
  return visible
}

/** setInterval that only ticks while `active` is true. */
export function useTicker(fn, ms, active = true) {
  useEffect(() => {
    if (!active) return
    const id = setInterval(fn, ms)
    return () => clearInterval(id)
  }, [fn, ms, active])
}

export const lerp = (a, b, t) => a + (b - a) * t
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
