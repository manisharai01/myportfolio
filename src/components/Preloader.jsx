import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { markReady } from '../lib/boot'
import { SIGNAL } from '../data/content'
import './Preloader.css'

const LOG = [
  { at: 4, t: '00.04', k: 'opening uplink', v: 'gurugram · in' },
  { at: 22, t: '00.31', k: 'handshake', v: 'ok · socket open' },
  { at: 44, t: '00.62', k: 'syncing commits', v: SIGNAL.commits.toLocaleString('en-IN') },
  { at: 66, t: '00.97', k: 'seating judges', v: 'E · H · C · M · B' },
  { at: 88, t: '01.28', k: 'all systems', v: 'nominal' },
]

function shouldSkip() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
  try {
    return sessionStorage.getItem('mr:booted') === '1'
  } catch {
    return false
  }
}

export default function Preloader() {
  const [skip] = useState(shouldSkip)
  const [n, setN] = useState(0)
  const [open, setOpen] = useState(!skip)

  useEffect(() => {
    if (skip) {
      markReady()
      return
    }
    const root = document.documentElement
    root.classList.add('is-booting')
    let raf = 0
    let fontsOk = false
    const fontTimer = setTimeout(() => { fontsOk = true }, 3200)
    ;(document.fonts?.ready ?? Promise.resolve()).then(() => { fontsOk = true })
    const start = performance.now()
    const D = 1750
    const tick = (now) => {
      const t = Math.min(1, (now - start) / D)
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      setN(Math.round(eased * 100))
      if (t < 1 || !fontsOk) {
        raf = requestAnimationFrame(tick)
        return
      }
      try { sessionStorage.setItem('mr:booted', '1') } catch { /* private mode */ }
      setTimeout(() => {
        setOpen(false)
        root.classList.remove('is-booting')
        markReady()
      }, 260)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(fontTimer)
      root.classList.remove('is-booting')
    }
  }, [skip])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="boot"
          aria-hidden="true"
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          transition={{ duration: 1.05, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="boot__top mono">
            <span>Manisha Rai — Portfolio</span>
            <span>Edition 2026</span>
          </div>
          <div className="boot__mid">
            <span className="boot__count">{String(n).padStart(3, '0')}</span>
          </div>
          <ul className="boot__log mono">
            {LOG.map((l) => (
              <li key={l.k} className={n >= l.at ? 'is-on' : ''}>
                <span className="boot__t">[{l.t}]</span>
                <span>{l.k}</span>
                <span className="boot__dots" />
                <span className="boot__v">{l.v}</span>
              </li>
            ))}
          </ul>
          <div className="boot__bar" style={{ transform: `scaleX(${n / 100})` }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
