import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { SIGNAL } from '../data/content'
import { Counter, Reveal, SectionHead } from './ui/Primitives.jsx'
import './Signal.css'

const DAY = 86400000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const level = (c) => (c === 0 ? 0 : c <= 2 ? 1 : c <= 5 ? 2 : c <= 9 ? 3 : 4)
const fmtDate = (d) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`

function Heatmap() {
  const wrapRef = useRef(null)
  const inView = useInView(wrapRef, { once: true, margin: '0px 0px -15% 0px' })
  const [tip, setTip] = useState(null)
  const start = Date.parse(SIGNAL.start + 'T00:00:00Z')
  const weeks = Math.ceil(SIGNAL.series.length / 7)
  const C = 12
  const G = 3
  const W = weeks * (C + G)
  const H = 7 * (C + G) + 22

  const months = useMemo(() => {
    const out = []
    let last = -1
    for (let w = 0; w < weeks; w++) {
      const d = new Date(start + w * 7 * DAY)
      if (d.getUTCMonth() !== last) {
        last = d.getUTCMonth()
        out.push({ w, label: d.getUTCMonth() === 0 ? `${MONTHS[0]} ’${String(d.getUTCFullYear()).slice(2)}` : MONTHS[last] })
      }
    }
    return out.filter((m, i, arr) => i === 0 || m.w - arr[i - 1].w > 2)
  }, [start, weeks])

  useEffect(() => {
    // on narrow screens, start scrolled to the most recent weeks
    const el = wrapRef.current
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = el.scrollWidth
  }, [])

  const onMove = (e) => {
    const t = e.target
    if (!(t instanceof SVGRectElement) || t.dataset.i == null) return setTip(null)
    const i = +t.dataset.i
    const r = t.getBoundingClientRect()
    const host = wrapRef.current.getBoundingClientRect()
    setTip({ x: r.left - host.left + r.width / 2 + wrapRef.current.scrollLeft, y: r.top - host.top, n: SIGNAL.series[i], d: fmtDate(new Date(start + i * DAY)) })
  }

  return (
    <div className="hm-wrap" ref={wrapRef} onMouseLeave={() => setTip(null)} data-lenis-prevent-horizontal>
      <svg className={`heat ${inView ? 'is-in' : ''}`} viewBox={`-30 0 ${W + 30} ${H}`} style={{ minWidth: 980 }} onMouseMove={onMove} role="img" aria-label={`Commit heatmap: ${SIGNAL.commits} commits on ${SIGNAL.activeDays} active days since ${SIGNAL.first}`}>
        {months.map((m) => (
          <text key={m.w} x={m.w * (C + G)} y={10} className="heat__month">
            {m.label}
          </text>
        ))}
        {['Mon', 'Wed', 'Fri'].map((d, i) => (
          <text key={d} x={-6} y={22 + (i * 2) * (C + G) + C - 2} className="heat__day" textAnchor="end">
            {d}
          </text>
        ))}
        {SIGNAL.series.map((c, i) => {
          const w = Math.floor(i / 7)
          const d = i % 7
          return (
            <rect
              key={i}
              data-i={i}
              x={w * (C + G)}
              y={18 + d * (C + G)}
              width={C}
              height={C}
              rx={2.5}
              className={`heat__c l${level(c)}`}
              style={{ '--d': `${w * 9}ms` }}
            />
          )
        })}
      </svg>
      {tip && (
        <div className="heat__tip mono" style={{ left: tip.x, top: tip.y }}>
          <b>{tip.n || 'No'} commit{tip.n === 1 ? '' : 's'}</b> · {tip.d}
        </div>
      )}
    </div>
  )
}

function Clock() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const max = Math.max(...SIGNAL.hours)
  const R0 = 46
  const R1 = 100
  const arc = (a0, a1, r) => {
    const p = (a) => [110 + r * Math.sin(a), 110 - r * Math.cos(a)]
    const [x0, y0] = p(a0)
    const [x1, y1] = p(a1)
    return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1}`
  }
  const A = (h) => (h / 24) * Math.PI * 2
  return (
    <figure className="panel clock" ref={ref}>
      <figcaption>
        <p className="mono panel__k">When I ship</p>
        <p className="panel__v">
          Peak at <b>{String(SIGNAL.peakHour).padStart(2, '0')}:00</b> IST
        </p>
      </figcaption>
      <svg viewBox="0 0 220 220" className="clock__svg" role="img" aria-label={`Commits by hour of day, peaking at ${SIGNAL.peakHour}:00`}>
        <path d={arc(A(9), A(18), 106)} className="clock__office" />
        <circle cx="110" cy="110" r={R0 - 6} className="clock__face" />
        {SIGNAL.hours.map((v, h) => {
          const a = A(h + 0.5)
          const len = (v / max) * (R1 - R0)
          const x0 = 110 + R0 * Math.sin(a)
          const y0 = 110 - R0 * Math.cos(a)
          const x1 = 110 + (R0 + Math.max(2, len)) * Math.sin(a)
          const y1 = 110 - (R0 + Math.max(2, len)) * Math.cos(a)
          return (
            <motion.line
              key={h}
              x1={x0}
              y1={y0}
              x2={x1}
              y2={y1}
              className={`clock__bar ${h === SIGNAL.peakHour ? 'is-peak' : ''} ${h < 9 || h >= 18 ? 'is-after' : ''}`}
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 0.9, delay: 0.2 + h * 0.03, ease: [0.16, 1, 0.3, 1] }}
            />
          )
        })}
        {[0, 6, 12, 18].map((h) => (
          <text key={h} x={110 + 30 * Math.sin(A(h))} y={113 - 30 * Math.cos(A(h))} className="clock__lbl" textAnchor="middle">
            {String(h).padStart(2, '0')}
          </text>
        ))}
      </svg>
      <p className="mono panel__foot">
        <span className="swatch swatch--office" /> 9–6 office hours · <b>{Math.round(SIGNAL.outsideShare * 100)}%</b> of commits land outside them
      </p>
    </figure>
  )
}

function Week() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const max = Math.max(...SIGNAL.dows)
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return (
    <figure className="panel week" ref={ref}>
      <figcaption>
        <p className="mono panel__k">Shape of a week</p>
        <p className="panel__v">
          <b>{Math.round(SIGNAL.weekendShare * 100)}%</b> on weekends
        </p>
      </figcaption>
      <div className="week__bars">
        {SIGNAL.dows.map((v, i) => (
          <div key={i} className={`week__col ${i >= 5 ? 'is-weekend' : ''}`}>
            <span className="mono week__n">{v}</span>
            <motion.span
              className="week__bar"
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: v / max } : {}}
              transition={{ duration: 1, delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            />
            <span className="mono week__d">{names[i]}</span>
          </div>
        ))}
      </div>
      <p className="mono panel__foot">
        Busiest on {['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'][SIGNAL.dows.indexOf(Math.max(...SIGNAL.dows))]} · Saturdays stay busy · Sundays mostly rest
      </p>
    </figure>
  )
}

function Langs() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const top = SIGNAL.langs.slice(0, 6)
  const other = 1 - top.reduce((s, l) => s + l.share, 0)
  const rows = [...top, { name: 'Other', share: other }]
  return (
    <figure className="panel langs" ref={ref}>
      <figcaption>
        <p className="mono panel__k">What I write</p>
        <p className="panel__v">
          <b>{Math.round(rows[0].share * 100)}%</b> {rows[0].name}
        </p>
      </figcaption>
      <div className="langs__bar" aria-hidden="true">
        {rows.map((l, i) => (
          <motion.span
            key={l.name}
            className={`langs__seg s${i}`}
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{ flexGrow: l.share }}
          />
        ))}
      </div>
      <ul className="langs__list">
        {rows.map((l, i) => (
          <li key={l.name}>
            <span className={`swatch s${i}`} />
            <span>{l.name}</span>
            <span className="mono">{(l.share * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
      <p className="mono panel__foot">Share of lines added · lockfiles, generated &amp; vendored code excluded</p>
    </figure>
  )
}

export default function Signal() {
  return (
    <section id="signal" className="section signal" aria-label="Signal — commit history">
      <div className="container">
        <SectionHead
          label="02 — Signal"
          title={[SIGNAL.commits.toLocaleString('en-IN'), 'commits later']}
          aside={`Every square is a day since February 2025 — pulled straight from git across ${SIGNAL.repos} repositories, work and personal. No estimates.`}
        />
        <div className="signal__stats">
          {[
            { v: SIGNAL.commits, k: 'Commits', note: `incl. merges · ${SIGNAL.nonMerge.toLocaleString('en-IN')} without` },
            { v: SIGNAL.activeDays, k: 'Active days', note: `since ${SIGNAL.first.slice(0, 7)}` },
            { v: SIGNAL.repos, k: 'Repositories', note: `${SIGNAL.reposWork} work · ${SIGNAL.reposPersonal} personal` },
            { v: SIGNAL.bestStreak, k: 'Day best streak', note: 'consecutive' },
          ].map((s, i) => (
            <Reveal key={s.k} delay={i * 0.06} className="stat">
              <Counter value={s.v} className="stat__v" />
              <p className="stat__k">{s.k}</p>
              <p className="mono stat__note">{s.note}</p>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <Heatmap />
        </Reveal>
        <div className="heat__legend mono">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <i key={l} className={`heat__c l${l}`} />
          ))}
          <span>More</span>
          <span className="heat__src">Source: git log · regenerated with scripts/collect-stats.mjs · {SIGNAL.generated}</span>
        </div>
        <div className="signal__panels">
          <Clock />
          <Week />
          <Langs />
        </div>
      </div>
    </section>
  )
}
