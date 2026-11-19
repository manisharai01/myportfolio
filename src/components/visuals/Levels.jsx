import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Screen, useLoop } from './Screen.jsx'

const EVENTS = [
  { pts: 10, why: 'Daily check-in' },
  { pts: 25, why: 'Categorised 5 transactions' },
  { pts: 40, why: 'Stayed under food budget' },
  { pts: 15, why: 'Created a budget' },
  { pts: 30, why: 'Weekly streak bonus' },
]
const BOARD = [
  { n: 'kavya.s', p: 9120 },
  { n: 'you', p: 8420, me: true },
  { n: 'arjun_m', p: 8395 },
  { n: 'neha.r', p: 7710 },
]
const CAP = 10000

export default function Levels() {
  const ref = useRef(null)
  const [i, setI] = useState(0)
  const [xp, setXp] = useState(8420)
  const [level, setLevel] = useState(4)
  const [streak, setStreak] = useState(23)
  const [burst, setBurst] = useState(false)

  const sim = useRef({ i: 0, xp: 8420 })
  useLoop(ref, () => {
    const s = sim.current
    const e = EVENTS[s.i % EVENTS.length]
    s.i += 1
    s.xp += e.pts * 9
    if (s.xp >= CAP) {
      s.xp = 8100
      setBurst(true)
      setLevel((l) => (l >= 6 ? 4 : l + 1))
      setTimeout(() => setBurst(false), 1500)
    }
    if (s.i % 3 === 0) setStreak((v) => v + 1)
    setXp(s.xp)
    setI(s.i)
  }, 1500)

  const ev = EVENTS[(i - 1 + EVENTS.length) % EVENTS.length]
  const board = BOARD.map((b) => (b.me ? { ...b, p: xp } : b)).sort((a, b) => b.p - a.p)

  return (
    <div ref={ref} className="vis vis--levels">
      <Screen title="Gamification engine — user 4f2a" meta="LIVE · 27 endpoints">
        <div className="lv">
          <div className="lv__top">
            <div className={`lv__avatar lv__avatar--${level}`}>
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="44" className="lv__track" />
                <motion.circle cx="50" cy="50" r="44" className="lv__ring" animate={{ pathLength: xp / CAP }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
              </svg>
              <span className="lv__lvl">L{level}</span>
            </div>
            <div className="lv__who">
              <p className="mono dim">Level {level} of 6</p>
              <p className="lv__title">{level === 6 ? 'Capital Imperium' : level === 1 ? 'Ledger Rookie' : `${6 - level} to Capital Imperium`}</p>
              <div className="lv__bar">
                <motion.span animate={{ scaleX: xp / CAP }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
              </div>
              <p className="mono dim">
                {xp.toLocaleString('en-IN')} / {CAP.toLocaleString('en-IN')} xp
              </p>
            </div>
            <AnimatePresence>
              {i > 0 && (
                <motion.div key={i} className="lv__pop mono" initial={{ y: 16, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -18, opacity: 0 }} transition={{ duration: 0.5 }}>
                  <b>+{ev.pts}</b> {ev.why}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lv__mid">
            <div className="lv__streak">
              <p className="mono dim">Streak</p>
              <p className="lv__streak-n">
                {streak}
                <span className="mono">days</span>
              </p>
              <div className="lv__cal" aria-hidden="true">
                {Array.from({ length: 28 }, (_, d) => (
                  <i key={d} className={d < 28 - 5 || d === 27 ? 'on' : d === 24 ? 'freeze' : ''} />
                ))}
              </div>
              <p className="mono lv__freeze">❄ 1 freeze card used</p>
            </div>
            <div className="lv__badges">
              <p className="mono dim">Badges</p>
              <div className="lv__badge-row">
                {[10, 30, 90, 180, 365].map((d) => (
                  <span key={d} className={`lv__badge ${streak >= d ? 'on' : ''}`}>
                    {d}
                    <i className="mono">d</i>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lv__board">
            <p className="mono dim">Leaderboard · weekly</p>
            <ol>
              {board.map((b, r) => (
                <motion.li layout key={b.n} className={b.me ? 'me' : ''} transition={{ type: 'spring', stiffness: 500, damping: 40 }}>
                  <span className="mono">{r + 1}</span>
                  <span>{b.n}</span>
                  <span className="mono">{b.p.toLocaleString('en-IN')}</span>
                </motion.li>
              ))}
            </ol>
          </div>

          <AnimatePresence>
            {burst && (
              <motion.div className="lv__burst" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
                <span className="mono">Level up</span>
                <b>L{level}</b>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Screen>
    </div>
  )
}
