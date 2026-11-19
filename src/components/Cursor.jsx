import { useEffect, useRef } from 'react'
import './Cursor.css'

/**
 * Dot + lagging ring. Elements opt into states with data attributes:
 *   data-cursor="view"           → ring grows and shows the label "View"
 *   data-cursor-label="Copy"     → custom label
 *   links / buttons              → ring swells
 * Fine pointers only; touch devices keep the native behaviour.
 */
export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!fine.matches) return
    const root = document.documentElement
    root.classList.add('has-cursor')

    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    let x = -100, y = -100, rx = -100, ry = -100
    let shown = false
    let raf = 0
    let state = ''

    const setState = (next, text = '') => {
      if (next === state && label.textContent === text) return
      state = next
      ring.dataset.state = next
      label.textContent = text
    }

    const onMove = (e) => {
      x = e.clientX
      y = e.clientY
      if (!shown) {
        shown = true
        rx = x
        ry = y
        dot.style.opacity = ring.style.opacity = '1'
      }
    }
    const onOver = (e) => {
      const t = e.target instanceof Element ? e.target : null
      const tagged = t?.closest('[data-cursor]')
      if (tagged) {
        const kind = tagged.getAttribute('data-cursor')
        if (kind === 'hide') return setState('hide')
        return setState('label', tagged.getAttribute('data-cursor-label') || kind)
      }
      if (t?.closest('a, button, [role="button"], label, summary')) return setState('link')
      if (t?.closest('input, textarea')) return setState('text')
      setState('')
    }
    const onLeave = () => {
      shown = false
      dot.style.opacity = ring.style.opacity = '0'
    }
    const onDown = () => ring.classList.add('is-down')
    const onUp = () => ring.classList.remove('is-down')

    const tick = () => {
      rx += (x - rx) * 0.2
      ry += (y - ry) * 0.2
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      cancelAnimationFrame(raf)
      root.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  return (
    <div className="cursor" aria-hidden="true">
      <div ref={ringRef} className="cursor__ring">
        <span className="cursor__disc" />
        <span ref={labelRef} className="cursor__label" />
      </div>
      <div ref={dotRef} className="cursor__dot" />
    </div>
  )
}
