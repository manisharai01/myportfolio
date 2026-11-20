import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLoop } from './Screen.jsx'

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
)
const BILLERS = [
  { k: 'Electricity', d: 'M13 2 4 14h7l-1 8 9-12h-7z' },
  { k: 'Mobile', d: 'M8 2h8a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 18h2' },
  { k: 'Water', d: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z' },
  { k: 'Gas', d: 'M12 22c4 0 6-2.5 6-6 0-4-3-6-4-10-2 2-3 4-3 6-1-1-1.5-2-1.5-3C7 11 6 13.5 6 16c0 3.5 2 6 6 6z' },
  { k: 'Broadband', d: 'M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01' },
  { k: 'Card bill', d: 'M3 6h18v12H3zM3 10h18M7 15h4' },
]
const STEPS = ['Record', 'Pay', 'Fulfil']
const TICKERS = [
  { s: 'NIFTY 50', p: 24312.4 },
  { s: 'RELIANCE', p: 2941.5 },
  { s: 'TCS', p: 4120.15 },
  { s: 'INFY', p: 1876.6 },
]

function spark(seed, n = 26) {
  let v = 50
  const pts = []
  let s = seed
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280
    v += (s / 233280 - 0.46) * 12
    v = Math.max(8, Math.min(92, v))
    pts.push(`${(i / (n - 1)) * 100},${100 - v}`)
  }
  return pts.join(' ')
}

export default function PhonePay() {
  const ref = useRef(null)
  const [tick, setTick] = useState(0)
  useLoop(ref, () => setTick((t) => t + 1), 900)

  // 0-1 idle, 2 record, 3 pay, 4 fulfil, 5-6 paid, 7-11 markets
  const phase = tick % 12
  const screen = phase < 7 ? 'bills' : 'markets'
  const dark = Math.floor(tick / 12) % 2 === 0
  const step = phase < 2 ? -1 : Math.min(3, phase - 2)
  const paid = phase >= 5 && phase < 7

  return (
    <div ref={ref} className="vis vis--phone">
      <div className="phone-stage">
        <div className={`phone ${dark ? 'is-dark' : 'is-light'}`}>
          <div className="phone__notch" />
          <div className="phone__status mono">
            <span>9:41</span>
            <span>5G ▮▮▮</span>
          </div>
          <AnimatePresence mode="wait">
            {screen === 'bills' ? (
              <motion.div key="bills" className="phone__screen" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}>
                <p className="ph__eyebrow mono">Pay bills &amp; recharge</p>
                <div className="ph__grid">
                  {BILLERS.map((b, i) => (
                    <div key={b.k} className={`ph__biller ${i === 0 ? 'is-on' : ''}`}>
                      <Icon d={b.d} />
                      <span>{b.k}</span>
                    </div>
                  ))}
                </div>
                <div className="ph__bill">
                  <div className="ph__bill-top">
                    <span>Electricity</span>
                    <span className="mono">CA ••4821</span>
                  </div>
                  <div className="ph__amt">₹1,240</div>
                  <p className="ph__due mono">Due 21 Nov · fetched via BBPS</p>
                  <div className={`ph__btn ${paid ? 'is-paid' : step >= 0 ? 'is-busy' : ''}`}>
                    {paid ? 'Paid ✓' : step >= 0 ? `${STEPS[Math.min(step, 2)]}…` : 'Pay ₹1,240'}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="mkts" className="phone__screen" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}>
                <p className="ph__eyebrow mono">Watchlist · live</p>
                <div className="ph__chart">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <polyline points={spark(11 + tick)} />
                  </svg>
                  <span className="mono">NIFTY 50 · 1D</span>
                </div>
                <ul className="ph__list">
                  {TICKERS.map((t, i) => {
                    const ch = Math.sin(tick * 1.7 + i * 2.1) * 1.4
                    return (
                      <li key={t.s}>
                        <span>{t.s}</span>
                        <span className="mono">{(t.p * (1 + ch / 100)).toFixed(2)}</span>
                        <span className={`mono ph__chg ${ch >= 0 ? 'up' : 'down'}`}>
                          {ch >= 0 ? '+' : ''}
                          {ch.toFixed(2)}%
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="phone__tabs mono">
            <span className={screen === 'bills' ? 'on' : ''}>Bills</span>
            <span className={screen === 'markets' ? 'on' : ''}>Markets</span>
            <span>Budget</span>
            <span>TFM AI</span>
          </div>
        </div>

        <div className="phone-side">
          <p className="mono phone-side__h">Payment flow</p>
          <ol className="flow">
            {STEPS.map((s, i) => (
              <li key={s} className={`mono ${screen === 'bills' && (step > i || paid) ? 'done' : ''} ${screen === 'bills' && step === i && !paid ? 'now' : ''}`}>
                <span className="flow__n">{i + 1}</span>
                <span>{['record txn', 'razorpay checkout', 'BBPS fulfil'][i]}</span>
              </li>
            ))}
          </ol>
          <div className="theme-pill mono">
            <span className={`theme-pill__knob ${dark ? '' : 'is-light'}`} />
            ThemeExtension · {dark ? 'dark' : 'light'}
          </div>
          <p className="mono phone-side__note">
            <span className="phone-side__flag">BBPS module · built, launch pending licence</span>
            staging ⇄ prod flavours · release guard on
          </p>
        </div>
      </div>
    </div>
  )
}
