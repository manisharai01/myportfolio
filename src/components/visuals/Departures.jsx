import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Flap, QrGlyph, Screen, useLoop } from './Screen.jsx'

/* Fictional vessels; real island names (Port Blair is now Sri Vijaya Puram). */
const ROWS = [
  { t: '06:20', route: 'SVPURAM → SWARAJ', v: 'KESTREL', c: 'PRM' },
  { t: '07:15', route: 'SVPURAM → SHAHEED', v: 'ASTER', c: 'STD' },
  { t: '08:40', route: 'SWARAJ → SHAHEED', v: 'MONSOON', c: 'CMF' },
  { t: '09:30', route: 'SVPURAM → LONG IS', v: 'CORAL', c: 'STD' },
  { t: '11:00', route: 'SVPURAM → RANGAT', v: 'TIDE', c: 'STD' },
  { t: '12:10', route: 'SHAHEED → SVPURAM', v: 'SAFFRON', c: 'PRM' },
]

const FRAMES = [
  ['DEPARTED', 'BOARDING', 'ON TIME', 'DELAY +25', 'ON TIME', 'ON TIME'],
  ['DEPARTED', 'DEPARTED', 'BOARDING', 'DELAY +25', 'ON TIME', 'ON TIME'],
  ['DEPARTED', 'DEPARTED', 'BOARDING', 'DELAY +40', 'CANCELLED', 'ON TIME'],
  ['DEPARTED', 'DEPARTED', 'DEPARTED', 'BOARDING', 'CANCELLED', 'ON TIME'],
]

const tone = (s) =>
  s.startsWith('CANCEL') ? 'bad' : s.startsWith('DELAY') ? 'warn' : s === 'BOARDING' ? 'hot' : s === 'DEPARTED' ? 'dim' : 'ok'

const SCANS = [
  { gate: 'gate-2', res: 'ADMIT', rows: 1 },
  { gate: 'gate-5', res: 'REJECT', rows: 0 },
]

export default function Departures() {
  const ref = useRef(null)
  const [f, setF] = useState(0)
  const [scan, setScan] = useState(0)
  useLoop(ref, () => {
    setF((x) => (x + 1) % FRAMES.length)
    setScan((x) => x + 1)
  }, 2900)
  const statuses = FRAMES[f]
  const advisory = statuses[4] === 'CANCELLED'
  const showReject = scan % 2 === 1

  return (
    <div ref={ref} className="vis vis--departures">
      <Screen title="Jetty board — Sri Vijaya Puram" meta="LIVE · roster v214">
        <div className="dep">
          <div className="dep__head mono">
            <span>Dep</span>
            <span>Crossing</span>
            <span className="dep__opt">Vessel</span>
            <span className="dep__opt">Cls</span>
            <span>Status</span>
          </div>
          {ROWS.map((r, i) => (
            <div className={`dep__row tone-${tone(statuses[i])}`} key={r.t}>
              <Flap value={r.t} />
              <span className="dep__route">{r.route}</span>
              <span className="dep__opt dep__v">MV {r.v}</span>
              <span className="dep__opt">{r.c}</span>
              <Flap value={statuses[i]} width={10} className="dep__st" />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {advisory ? (
            <motion.div key="adv" className="dep__adv mono" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <span className="dep__adv-tag">Advisory</span> Sea state 5 — Rangat crossings off-roster · refunds queued
            </motion.div>
          ) : (
            <motion.div key="ok" className="dep__adv dep__adv--ok mono" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <span className="dep__adv-tag">Roster</span> 34 crossings · turnaround checks passed · 0 conflicts
            </motion.div>
          )}
        </AnimatePresence>

        <div className="dep__foot">
          <div className="pass">
            <QrGlyph seed={41} className="pass__qr" />
            <div className="pass__info mono">
              <span className="pass__id">PASS · A7K-39Q</span>
              <span>SVPURAM → SWARAJ</span>
              <span>2 ADULT · STD · 07:15</span>
              <span className="pass__sig">HMAC-SHA256 ✓</span>
            </div>
            <AnimatePresence>
              <motion.span
                key={scan}
                className="pass__stamp"
                initial={{ scale: 1.8, opacity: 0, rotate: -14 }}
                animate={{ scale: 1, opacity: 1, rotate: -8 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
              >
                Admitted
              </motion.span>
            </AnimatePresence>
          </div>
          <ul className="gatelog mono" aria-label="Gate scan log">
            <li className="ok">
              <span>{SCANS[0].gate}</span> admit A7K-39Q <b>✓ 1 row</b>
            </li>
            <AnimatePresence>
              {showReject && (
                <motion.li className="bad" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <span>{SCANS[1].gate}</span> admit A7K-39Q <b>✕ 0 rows</b>
                </motion.li>
              )}
            </AnimatePresence>
            <li className="note">one conditional UPDATE → no double entry</li>
          </ul>
        </div>
      </Screen>
    </div>
  )
}
