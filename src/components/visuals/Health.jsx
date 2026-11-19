import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Screen, useLoop } from './Screen.jsx'

const SERVICES = ['user-service', 'trading', 'payment', 'mail-reader', 'ai-agent']
const BASE = [98, 95, 96, 97, 93]
const P95 = [142, 210, 188, 96, 640]

function ecg(offset, seed, degraded) {
  // a heartbeat line; each beat is a QRS spike
  const pts = []
  for (let i = 0; i <= 60; i++) {
    const x = i
    const k = (i + offset) % 15
    let y = 50 + Math.sin((i + seed) * 0.9) * 1.5
    if (k === 6) y = degraded ? 34 : 18
    if (k === 7) y = degraded ? 62 : 80
    if (k === 8) y = 44
    pts.push(`${(x / 60) * 100},${y}`)
  }
  return pts.join(' ')
}

const state = (s) => (s >= 85 ? 'up' : s >= 60 ? 'degraded' : 'down')

export default function Health() {
  const ref = useRef(null)
  const [t, setT] = useState(0)
  const [log, setLog] = useState([{ id: 0, at: '09:41:00', msg: 'poll ok · 5/5 services UP' }])
  const tRef = useRef(0)
  useLoop(ref, () => {
    const n = ++tRef.current
    const phase = n % 16
    const stamp = `09:${String(41 + (Math.floor(n / 4) % 18)).padStart(2, '0')}:${String((n * 7) % 60).padStart(2, '0')}`
    const msg =
      phase === 5 ? 'payment p95 912ms → DEGRADED · ws push' : phase === 11 ? 'payment recovered → UP · alert closed' : phase === 0 ? 'poll ok · 5/5 services UP' : null
    if (msg) setLog((l) => [{ id: n, at: stamp, msg }, ...l].slice(0, 3))
    setT(n)
  }, 700)

  const phase = t % 16
  const scores = BASE.map((b, i) => {
    let s = b + Math.round(Math.sin(t * 0.8 + i * 1.7) * 1.4)
    if (i === 2 && phase >= 5 && phase < 11) s = 64 + Math.round(Math.sin(t) * 3)
    return Math.max(0, Math.min(100, s))
  })
  const composite = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

  return (
    <div ref={ref} className="vis vis--health">
      <Screen title="Fleet health — poll 30s · cron" meta="WS CONNECTED">
        <div className="hm">
          <div className="hm__top">
            <div>
              <p className="mono dim">Composite score</p>
              <p className="hm__score">
                {composite}
                <span>/100</span>
              </p>
            </div>
            <ul className="hm__weights mono" aria-label="Score weights">
              <li><span>avail</span><b style={{ width: '35%' }} />35</li>
              <li><span>errors</span><b style={{ width: '25%' }} />25</li>
              <li><span>p95</span><b style={{ width: '20%' }} />20</li>
              <li><span>cpu/mem</span><b style={{ width: '10%' }} />10</li>
              <li><span>deps</span><b style={{ width: '10%' }} />10</li>
            </ul>
          </div>
          <ul className="hm__list">
            {SERVICES.map((s, i) => {
              const st = state(scores[i])
              const deg = st !== 'up'
              return (
                <li key={s} className={`hm__svc is-${st}`}>
                  <span className="hm__name mono">
                    <span className="hm__dot" /> {s}
                  </span>
                  <svg className="hm__ecg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <polyline points={ecg(t * 2 + i * 3, i, deg)} />
                  </svg>
                  <span className="mono hm__p95">p95 {deg ? 900 + ((t * 37) % 60) : P95[i] + ((t * 13 + i * 7) % 18)}ms</span>
                  <span className="hm__val mono">{scores[i]}</span>
                  <span className="hm__state mono">{st.toUpperCase()}</span>
                </li>
              )
            })}
          </ul>
          <ul className="hm__log mono" aria-label="Alert log">
            <AnimatePresence initial={false}>
              {log.map((l) => (
                <motion.li key={l.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <span className="dim">{l.at}</span> {l.msg}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </Screen>
    </div>
  )
}
