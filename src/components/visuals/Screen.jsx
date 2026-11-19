import { useEffect, useRef, useState } from 'react'

/** Window chrome shared by every visual. */
export function Screen({ title, meta, children, className = '', live = true }) {
  return (
    <div className={`screen ${className}`}>
      <div className="screen__bar mono">
        <span className="screen__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="screen__title">{title}</span>
        <span className="screen__meta">
          {live && <span className="live-dot" />} {meta}
        </span>
      </div>
      <div className="screen__body">{children}</div>
    </div>
  )
}

/** Runs `fn` every `ms` while the element is on screen and motion is allowed. */
export function useLoop(ref, fn, ms) {
  const saved = useRef(fn)
  saved.current = fn
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let id = 0
    const io = new IntersectionObserver(([e]) => {
      clearInterval(id)
      if (e.isIntersecting) id = setInterval(() => saved.current(), ms)
    }, { rootMargin: '80px' })
    io.observe(el)
    return () => {
      clearInterval(id)
      io.disconnect()
    }
  }, [ref, ms])
}

const FLAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-:.✓'

/** Split-flap text: characters riffle before landing on the new value. */
export function Flap({ value, width, className = '' }) {
  const target = value.padEnd(width ?? value.length, ' ')
  const [shown, setShown] = useState(target)
  const prev = useRef(target)
  useEffect(() => {
    if (prev.current === target) return
    const from = prev.current
    prev.current = target
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(target)
      return
    }
    let frame = 0
    const id = setInterval(() => {
      frame++
      let out = ''
      for (let i = 0; i < target.length; i++) {
        const settle = 3 + i * 0.9
        if (frame >= settle || from[i] === target[i]) out += target[i]
        else out += FLAP[(Math.random() * FLAP.length) | 0]
      }
      setShown(out)
      if (frame > 3 + target.length) clearInterval(id)
    }, 45)
    return () => clearInterval(id)
  }, [target])
  return (
    <span className={`flap ${className}`} aria-label={value.trim()}>
      {[...shown].map((c, i) => (
        <span key={i} className={`flap__c ${c !== target[i] ? 'is-moving' : ''}`} aria-hidden="true">
          {c === ' ' ? ' ' : c}
        </span>
      ))}
    </span>
  )
}

/** Deterministic QR-ish matrix with finder patterns (decorative). */
export function QrGlyph({ seed = 7, size = 21, className = '' }) {
  let s = seed
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  const finder = (x, y) => {
    const inBox = (ox, oy) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7
    for (const [ox, oy] of [[0, 0], [size - 7, 0], [0, size - 7]]) {
      if (inBox(ox, oy)) {
        const dx = x - ox, dy = y - oy
        const ring = dx === 0 || dy === 0 || dx === 6 || dy === 6
        const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4
        return ring || core ? 1 : 0
      }
    }
    return -1
  }
  const cells = []
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const f = finder(x, y)
      const on = f === -1 ? rnd() > 0.52 : f === 1
      if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)
    }
  return (
    <svg className={className} viewBox={`-1 -1 ${size + 2} ${size + 2}`} shapeRendering="crispEdges" aria-hidden="true">
      <rect x="-1" y="-1" width={size + 2} height={size + 2} fill="#ede8df" />
      <g fill="#0b0a09">{cells}</g>
    </svg>
  )
}
