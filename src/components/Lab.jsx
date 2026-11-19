import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { LAB, SIGNAL } from '../data/content'
import { ArrowUpRight, Reveal, SectionHead } from './ui/Primitives.jsx'
import { useLoop } from './visuals/Screen.jsx'
import './Lab.css'

/* ------------------------- tiny previews ------------------------- */
const AGENT = [
  ['›', 'menderbit run "fix the flaky date test"', 'cmd'],
  ['◦', 'explore    214 files indexed · FTS5', ''],
  ['◦', 'plan       3 steps · done when tests are green', ''],
  ['◦', 'edit       src/date.ts  +4 −2', ''],
  ['◦', 'check      vitest — 41 passed, 0 failed', ''],
  ['✓', 'verified   evidence: 41/41 · 0 regressions', 'ok'],
]
function Agent() {
  const ref = useRef(null)
  const [n, setN] = useState(AGENT.length)
  useLoop(ref, () => setN((x) => (x >= AGENT.length + 3 ? 1 : x + 1)), 650)
  return (
    <div ref={ref} className="pv pv--agent mono" aria-hidden="true">
      {AGENT.slice(0, Math.min(n, AGENT.length)).map(([g, t, k], i) => (
        <motion.p key={i} className={k} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
          <span className="pv__g">{g}</span> {t}
        </motion.p>
      ))}
      <span className="pv__caret" />
    </div>
  )
}

function Film() {
  const ref = useRef(null)
  const [f, setF] = useState(0)
  useLoop(ref, () => setF((x) => x + 1), 120)
  const shot = Math.floor(f / 24) % 6
  return (
    <div ref={ref} className="pv pv--film" aria-hidden="true">
      <div className="film__strip">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`film__frame f${i} ${i === shot ? 'is-on' : ''}`} />
        ))}
      </div>
      <div className="film__bar">
        <span className="film__head" style={{ left: `${((f % 144) / 144) * 100}%` }} />
      </div>
      <p className="mono">
        shot {shot + 1}/6 · 00:00:{String(Math.floor((f % 144) / 4.8)).padStart(2, '0')} · continuity ✓
      </p>
    </div>
  )
}

function Lint() {
  return (
    <div className="pv pv--lint mono" aria-hidden="true">
      <p><span className="k">const</span> user = users.<span className="f">find</span>(u =&gt; u.id === id)</p>
      <p><span className="k">return</span> <span className="squig">user.name</span></p>
      <p className="warn">⚠ IED-014 possible null after find()</p>
      <p className="dim">quick fix: user?.name ?? fallback</p>
    </div>
  )
}

const MOODS = [
  ['joy', 0.42],
  ['calm', 0.31],
  ['anxious', 0.18],
  ['anger', 0.09],
]
function Mood() {
  const ref = useRef(null)
  const [t, setT] = useState(0)
  useLoop(ref, () => setT((x) => x + 1), 1400)
  return (
    <div ref={ref} className="pv pv--mood" aria-hidden="true">
      {MOODS.map(([k, v], i) => {
        const w = Math.max(0.05, Math.min(0.9, v + Math.sin(t + i * 1.8) * 0.08))
        return (
          <div key={k} className="mood__row mono">
            <span>{k}</span>
            <span className="mood__bar">
              <motion.span animate={{ scaleX: w }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
            </span>
            <span>{Math.round(w * 100)}%</span>
          </div>
        )
      })}
      <p className="mono dim">red flags: 0 · hinglish detected</p>
    </div>
  )
}

function Wave() {
  const ref = useRef(null)
  const [t, setT] = useState(0)
  useLoop(ref, () => setT((x) => x + 1), 110)
  return (
    <div ref={ref} className="pv pv--wave" aria-hidden="true">
      <div className="wave__bars">
        {Array.from({ length: 42 }, (_, i) => {
          const h = 0.18 + Math.abs(Math.sin(i * 0.55 + t * 0.35) * Math.cos(i * 0.21 - t * 0.15)) * 0.82
          return <span key={i} style={{ transform: `scaleY(${h.toFixed(3)})` }} />
        })}
      </div>
      <p className="mono">take B ✓ · −16 LUFS · whisper match 99%</p>
    </div>
  )
}

function Bars() {
  return (
    <div className="pv pv--bars" aria-hidden="true">
      <div className="bars__row">
        <span className="mono">REST</span>
        <span className="bars__bar bars__bar--slow" />
        <span className="mono">163 s</span>
      </div>
      <div className="bars__row">
        <span className="mono">GraphQL</span>
        <span className="bars__bar bars__bar--fast" />
        <span className="mono">23 s</span>
      </div>
      <p className="mono dim">1,559 requests → 80</p>
    </div>
  )
}

function Limit() {
  const ref = useRef(null)
  const [n, setN] = useState(24)
  useLoop(ref, () => setN((x) => (x >= 34 ? 22 : x + 1)), 500)
  const done = n >= 30
  return (
    <div ref={ref} className={`pv pv--limit ${done ? 'is-done' : ''}`} aria-hidden="true">
      <p className="limit__n">
        {Math.min(n, 30)}
        <span>/30</span>
      </p>
      <p className="mono">{done ? 'reels feed closed · rest of the app works' : 'reels watched today'}</p>
    </div>
  )
}

function Spell() {
  const ref = useRef(null)
  const [n, setN] = useState(5)
  useLoop(ref, () => setN((x) => (x >= 8 ? 1 : x + 1)), 520)
  return (
    <div ref={ref} className="pv pv--spell" aria-hidden="true">
      <div className="spell__row">
        {'HELLO'.split('').map((c, i) => (
          <span key={i} className={i < n ? 'on' : ''}>
            {c}
          </span>
        ))}
      </div>
      <p className="mono">MobileNetV2 · conf 0.94 · speaking…</p>
    </div>
  )
}

const PREVIEWS = { agent: Agent, film: Film, lint: Lint, mood: Mood, wave: Wave, bars: Bars, limit: Limit, spell: Spell }

export default function Lab() {
  return (
    <section id="lab" className="section lab" aria-label="Lab — personal projects">
      <div className="lab__glow" aria-hidden="true" />
      <div className="container">
        <SectionHead
          label="04 — Lab / after hours"
          title={['After', 'hours']}
          aside={`${Math.round(SIGNAL.outsideShare * 100)}% of my commits land outside 9-to-6. Some become these: local-first AI, developer tools, and apps I wanted to exist.`}
        />
        <div className="lab__grid">
          {LAB.map((p, i) => {
            const Preview = PREVIEWS[p.preview]
            return (
              <Reveal key={p.id} delay={(i % 3) * 0.06} className={`lcard ${p.span === 'wide' ? 'lcard--wide' : ''}`}>
                <div className="lcard__preview">
                  <Preview />
                </div>
                <div className="lcard__body">
                  <div className="lcard__head">
                    <h3 className="lcard__name">{p.name}</h3>
                    <span className="lcard__status mono">{p.status}</span>
                  </div>
                  <p className="lcard__what">{p.what}</p>
                  <p className="lcard__stat mono">
                    <span>▸</span> {p.stat}
                  </p>
                  <ul className="lcard__stack mono">
                    {p.stack.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  {(p.href || p.live) && (
                    <div className="lcard__links">
                      {p.live && (
                        <a href={p.live} target="_blank" rel="noreferrer" className="mono" data-cursor="label" data-cursor-label="Live">
                          Live demo <ArrowUpRight width={11} height={11} />
                        </a>
                      )}
                      {p.href && (
                        <a href={p.href} target="_blank" rel="noreferrer" className="mono" data-cursor="label" data-cursor-label="Code">
                          Source <ArrowUpRight width={11} height={11} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
