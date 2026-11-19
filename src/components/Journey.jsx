import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { CERTS, RELEASES, SIGNAL } from '../data/content'
import { useViewportKey } from '../lib/hooks'
import { Reveal, SectionHead } from './ui/Primitives.jsx'
import './Journey.css'

/* ------------------------------------------------------------------ */
/*  Commit track: real monthly commits from Jun 2024 → last commit     */
/* ------------------------------------------------------------------ */
const T0 = { y: 2024, m: 5 } // Jun 2024 (0-based month)
const PRE = 0.06 // the first 6% of the track stands in for 2022 → mid-2024
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const mIndex = (y, m) => (y - T0.y) * 12 + (m - T0.m)

function useTrack() {
  return useMemo(() => {
    const last = new Date(SIGNAL.last + 'T00:00:00Z')
    const total = mIndex(last.getUTCFullYear(), last.getUTCMonth()) + 1
    const counts = new Array(total).fill(0)
    const start = Date.parse(SIGNAL.start + 'T00:00:00Z')
    SIGNAL.series.forEach((c, i) => {
      if (!c) return
      const d = new Date(start + i * 86400000)
      const k = mIndex(d.getUTCFullYear(), d.getUTCMonth())
      if (k >= 0 && k < total) counts[k] += c
    })
    const max = Math.max(...counts, 1)
    const x = (k) => PRE + (1 - PRE) * ((k + 0.5) / total)
    const bars = counts.map((c, k) => ({ k, c, x: x(k), h: c ? Math.max(0.05, c / max) : 0 }))
    const pins = RELEASES.map((r) => {
      if (!r.at) return 0.018
      const [y, m] = r.at.split('-').map(Number)
      return x(mIndex(y, m - 1))
    })
    const years = []
    for (let y = T0.y + 1; y <= last.getUTCFullYear(); y++) years.push({ y, x: x(mIndex(y, 0)) - (0.5 * (1 - PRE)) / total })
    const peak = counts.indexOf(max)
    const peakLabel = `${MONTHS[(T0.m + peak) % 12]} ${T0.y + Math.floor((T0.m + peak) / 12)}`
    return { bars, pins, years, total, max, peakLabel }
  }, [])
}

function Track({ track, active, trackRef, lit = false }) {
  return (
    <div className="trk" ref={trackRef} style={lit ? { '--ph': 1 } : undefined} aria-hidden="true">
      <span className="trk__pre" />
      <span className="trk__axis" />
      <span className="trk__lbl mono" style={{ '--x': 0.018 }}>
        ’22
      </span>
      {track.years.map((y) => (
        <span key={y.y} className="trk__lbl mono" style={{ '--x': y.x }}>
          {y.y}
        </span>
      ))}
      <span className="trk__lbl trk__lbl--end mono" style={{ '--x': 1 }}>
        Now
      </span>
      {track.bars.map((b) =>
        b.c ? <span key={b.k} className="trk__bar" style={{ '--x': b.x, '--hgt': b.h, '--n': track.total }} /> : null
      )}
      {track.pins.map((x, i) => (
        <span key={i} className={`trk__pin ${i <= active ? 'is-on' : ''} ${i === active ? 'is-active' : ''} ${i % 2 ? 'is-low' : ''}`} style={{ '--x': x }}>
          <i>
            v{RELEASES[i].v[0]}.{RELEASES[i].v[1]}
          </i>
        </span>
      ))}
      {!lit && <span className="trk__ph" />}
      <span className="trk__note mono">
        <b>{SIGNAL.commits.toLocaleString('en-IN')}</b> commits · peak {track.peakLabel}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Pieces                                                             */
/* ------------------------------------------------------------------ */
function Digit({ d }) {
  return (
    <span className="odo__cell">
      <span className="odo__col" style={{ transform: `translateY(${-d * 10}%)` }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </span>
    </span>
  )
}

function Odometer({ v, className = '' }) {
  return (
    <div className={`odo ${className}`} aria-hidden="true">
      <span className="odo__v">v</span>
      <Digit d={v[0]} />
      <span className="odo__dot">.</span>
      <Digit d={v[1]} />
    </div>
  )
}

function TypeLine({ text }) {
  const reduce = useReducedMotion()
  const [n, setN] = useState(text.length)
  useEffect(() => {
    if (reduce) {
      setN(text.length)
      return
    }
    setN(0)
    let i = 0
    const id = setInterval(() => {
      i += 1
      setN(i)
      if (i >= text.length) clearInterval(id)
    }, 30)
    return () => clearInterval(id)
  }, [text, reduce])
  return (
    <p className="jr__cmd">
      <span className="jr__prompt">~/career $</span> {text.slice(0, n)}
      <span className="jr__caret" />
    </p>
  )
}

const symClass = (s) => (s === '+' ? 'add' : s === '~' ? 'imp' : s === '✓' ? 'done' : 'next')

function ReleaseBody({ r }) {
  return (
    <>
      <p className="jr__when mono">
        {r.when}
        {r.head && <span className="jr__head">HEAD → main</span>}
      </p>
      <h3 className="jr__role">{r.role}</h3>
      <p className="jr__org">{r.org}</p>
      <ul className="jr__notes">
        {r.notes.map(([s, t], k) => (
          <li key={k} style={{ '--k': k }}>
            <span className={`jr__sym is-${symClass(s)}`}>{s}</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <ul className="jr__tags">
        {r.tags.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Pinned: scroll steps through the releases                          */
/* ------------------------------------------------------------------ */
function Pinned({ track, stageRef }) {
  const scrollerRef = useRef(null)
  const trackRef = useRef(null)
  const N = RELEASES.length
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  const { scrollYProgress } = useScroll({ target: scrollerRef, offset: ['start start', 'end end'] })

  // One scroll step per release. The playhead travels from each release's pin to the
  // next; on the last step it runs on from the current role to "now", lighting up
  // every month of the role you're still in.
  const sync = (p) => {
    const X = [...track.pins, 1]
    const pos = Math.min(N, Math.max(0, p * N))
    const i = Math.min(N - 1, Math.floor(pos))
    const f = Math.min(1, pos - i)
    trackRef.current?.style.setProperty('--ph', (X[i] + (X[i + 1] - X[i]) * f).toFixed(4))
    if (i !== activeRef.current) {
      activeRef.current = i
      setActive(i)
    }
  }
  useMotionValueEvent(scrollYProgress, 'change', sync)
  useEffect(() => sync(scrollYProgress.get()), []) // eslint-disable-line react-hooks/exhaustive-deps

  const r = RELEASES[active]
  return (
    <div ref={scrollerRef} className="jr" style={{ '--steps': N }}>
      <div ref={stageRef} className="jr__stage" aria-hidden="true">
        <div className="jr__ghostwrap">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={r.code}
              className="jr__ghost"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -60 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {r.code}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="jr__bar mono">
          <span>03 — Journey · changelog</span>
          <span className="jr__dots">
            {RELEASES.map((_, i) => (
              <i key={i} className={i === active ? 'on' : i < active ? 'past' : ''} />
            ))}
          </span>
          <span className="jr__count">
            release <b>{String(active + 1).padStart(2, '0')}</b> / {String(N).padStart(2, '0')}
          </span>
        </div>

        <div className="jr__main">
          <div className="jr__left">
            <Odometer v={r.v} />
            <p className="jr__code mono">
              codename <b>{r.code}</b>
            </p>
            <TypeLine text={r.cmd} />
          </div>
          <div className="jr__panels">
            {RELEASES.map((rel, i) => (
              <article key={i} className={`jr__panel ${i === active ? 'is-active' : ''}`}>
                <ReleaseBody r={rel} />
              </article>
            ))}
          </div>
        </div>

        <Track track={track} active={active} trackRef={trackRef} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  List: phones that can't fit the pinned stage                       */
/* ------------------------------------------------------------------ */
function OdoOnView({ v }) {
  const ref = useRef(null)
  const seen = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  return (
    <div ref={ref}>
      <Odometer v={seen ? v : [0, 0]} className="odo--list" />
    </div>
  )
}

function List({ track }) {
  return (
    <div className="jl container">
      <Reveal className="jl__track">
        <Track track={track} active={RELEASES.length - 1} lit />
      </Reveal>
      <ol className="jl__list">
        {RELEASES.map((r) => (
          <Reveal as="li" key={r.code} className={`jl__item ${r.head ? 'is-head' : ''}`}>
            <div className="jl__ver">
              <OdoOnView v={r.v} />
              <p className="jr__code mono">
                codename <b>{r.code}</b>
              </p>
            </div>
            <div className="jl__body">
              <ReleaseBody r={r} />
              <p className="jr__cmd jr__cmd--static">
                <span className="jr__prompt">~/career $</span> {r.cmd}
              </p>
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  )
}

/* ------------------------------------------------------------------ */
export default function Journey() {
  const track = useTrack()
  const stageRef = useRef(null)
  const vpKey = useViewportKey()
  const [pinned, setPinned] = useState(true)

  // Pin only when the tallest release fits the stage; otherwise use the list.
  useLayoutEffect(() => setPinned(true), [vpKey])
  useLayoutEffect(() => {
    if (!pinned) return
    const stage = stageRef.current
    if (!stage) return
    const check = () => {
      if (window.innerHeight < 560 || stage.scrollHeight > stage.clientHeight + 2) setPinned(false)
    }
    check()
    document.fonts?.ready.then(check)
  }, [pinned, vpKey])

  return (
    <section id="journey" className="section section--bone journey" aria-label="Journey">
      <div className="container">
        <SectionHead
          label="03 — Journey"
          title={['Release', 'notes']}
          aside="Intern to owner in under two years. Every role shipped as a version — scroll to step through the changelog."
        />
      </div>

      {/* full text for assistive tech; the animated stage is decorative */}
      <ol className="sr-only">
        {RELEASES.map((r) => (
          <li key={r.code}>
            {r.role}, {r.org}, {r.when}. {r.notes.map(([, t]) => t).join('. ')}.
          </li>
        ))}
      </ol>

      {pinned ? <Pinned track={track} stageRef={stageRef} /> : <List track={track} />}

      <div className="container">
        <Reveal className="certs">
          <p className="mono certs__k">Certifications</p>
          <ul>
            {CERTS.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
