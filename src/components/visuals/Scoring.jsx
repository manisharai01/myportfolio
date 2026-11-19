import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Screen, useLoop } from './Screen.jsx'

const JUDGES = ['E', 'H', 'C', 'M', 'B']
const FIELD = [
  { n: 'ASTER', bib: 7, pct: 74.112 },
  { n: 'MONSOON', bib: 21, pct: 71.98 },
  { n: 'SAFFRON', bib: 3, pct: 70.204 },
  { n: 'KESTREL', bib: 9, pct: 68.775 },
]
const MARKS = [6.5, 7, 7, 7.5, 7.5, 8, 8, 8.5]

export default function Scoring() {
  const ref = useRef(null)
  const [mv, setMv] = useState(17)
  const [turn, setTurn] = useState(0)
  const [marks, setMarks] = useState([7.5, 8, 7, null, null])
  const [live, setLive] = useState(72.456)
  const [delta, setDelta] = useState(0.31)
  const [seq, setSeq] = useState(1284)
  const turnRef = useRef(0)

  useLoop(ref, () => {
    const t = ++turnRef.current
    const j = (t + 2) % 5 // judge submitting on this tick (starts at M: tiles E–C already in)
    const mark = MARKS[(Math.random() * MARKS.length) | 0]
    setSeq((s) => s + 1)
    if (j === 0) {
      setMv((m) => (m >= 33 ? 1 : m + 1))
      setMarks([mark, null, null, null, null])
    } else {
      setMarks((ms) => ms.map((m, i) => (i === j ? mark : m)))
    }
    if (j === 4) {
      const d = (Math.random() - 0.35) * 1.4
      setDelta(d)
      setLive((p) => Math.min(76.4, Math.max(69.2, p + d)))
    }
    setTurn(t)
  }, 950)

  const activeJudge = (turn + 3) % 5
  const standings = [...FIELD, { n: 'ZEPHYR', bib: 14, pct: live, live: true }].sort((a, b) => b.pct - a.pct)

  return (
    <div ref={ref} className="vis vis--scoring">
      <Screen title="Dressage — FEI Grand Prix · Arena 1" meta={`LIVE · seq #${seq}`}>
        <div className="sc">
          <div className="sc__now">
            <div>
              <p className="mono sc__label">Now riding</p>
              <p className="sc__horse">
                <span className="mono">#14</span> Zephyr
              </p>
            </div>
            <div className="sc__mv mono">
              Movement <b>{String(mv).padStart(2, '0')}</b>/33
            </div>
          </div>

          <div className="sc__judges">
            {JUDGES.map((j, i) => (
              <div key={j} className={`sc__judge ${i === activeJudge ? 'is-active' : ''} ${marks[i] == null ? 'is-wait' : ''}`}>
                <span className="mono sc__j">{j}</span>
                <motion.span key={`${mv}-${i}-${marks[i]}`} className="sc__mark" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
                  {marks[i] == null ? '—' : marks[i].toFixed(1)}
                </motion.span>
              </div>
            ))}
          </div>

          <div className="sc__total">
            <span className="sc__pct">{live.toFixed(3)}%</span>
            <span className={`mono sc__delta ${delta >= 0 ? 'up' : 'down'}`}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(2)}
            </span>
          </div>

          <div className="sc__table">
            <p className="mono sc__label">Standings · live</p>
            <ol>
              {standings.map((h, i) => (
                <motion.li layout transition={{ type: 'spring', stiffness: 500, damping: 40 }} key={h.n} className={h.live ? 'is-live' : ''}>
                  <span className="mono sc__rank">{i + 1}</span>
                  <span className="sc__name">
                    {h.n} <span className="mono dim">#{h.bib}</span>
                  </span>
                  <span className="mono sc__p">{h.pct.toFixed(3)}%</span>
                </motion.li>
              ))}
            </ol>
          </div>

          <div className="sc__foot mono">
            <span>judges 5/5 online</span>
            <span>session lock 90s</span>
            <span>redis · standings cached</span>
          </div>
        </div>
      </Screen>
    </div>
  )
}
