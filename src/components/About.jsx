import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import Portrait from './Portrait.jsx'
import { Reveal, Scramble } from './ui/Primitives.jsx'
import { FACTS, MANIFESTO } from '../data/content'
import './About.css'

/* ---------- inline chips: tiny live visuals inside the sentence ---------- */
function ScoreChip() {
  const [v, setV] = useState(72.456)
  useEffect(() => {
    const id = setInterval(() => setV((x) => Math.min(79.9, Math.max(66, x + (Math.random() - 0.42) * 0.9))), 1100)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="chip-in chip-in--score">
      <span className="chip-in__judges">
        {['E', 'H', 'C'].map((j) => <i key={j}>{j}</i>)}
      </span>
      <b>{v.toFixed(2)}%</b>
    </span>
  )
}

function Chip({ kind }) {
  if (kind === 'live')
    return (
      <span className="chip-in chip-in--live">
        <span className="live-dot" /> LIVE
      </span>
    )
  if (kind === 'score') return <ScoreChip />
  if (kind === 'pay')
    return (
      <span className="chip-in chip-in--pay">
        ₹1,240 <span className="chip-in__check">✓</span>
      </span>
    )
  if (kind === 'qr')
    return (
      <span className="chip-in chip-in--qr" aria-hidden="true">
        <svg viewBox="0 0 7 7" shapeRendering="crispEdges">
          {[0b1110111, 0b1010101, 0b1110011, 0b0001100, 0b1101011, 0b1010110, 0b1110101].map((row, y) =>
            [...Array(7)].map((_, x) => (row >> (6 - x)) & 1 ? <rect key={`${x}${y}`} x={x} y={y} width="1" height="1" /> : null)
          )}
        </svg>
        <span>ADMIT 1</span>
      </span>
    )
  return null
}

/* ---------- scroll-lit words ---------- */
function Word({ children, range, progress, className, still }) {
  const opacity = useTransform(progress, range, [0.13, 1])
  return (
    <motion.span style={still ? undefined : { opacity }} className={className}>
      {children}
    </motion.span>
  )
}

function Manifesto() {
  const ref = useRef(null)
  const still = useReducedMotion() // reduced motion → the whole statement, fully legible
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.82', 'end 0.45'] })
  // flatten into tokens
  const tokens = []
  MANIFESTO.forEach((part) => {
    if (typeof part === 'string') part.split(' ').filter(Boolean).forEach((w) => tokens.push({ w }))
    else if (part.em) part.em.split(' ').forEach((w) => tokens.push({ w, em: true }))
    else if (part.chip) tokens.push({ chip: part.chip })
  })
  const n = tokens.length
  const plain = MANIFESTO.filter((p) => typeof p === 'string' || p.em).map((p) => (typeof p === 'string' ? p : p.em)).join(' ')
  return (
    <p ref={ref} className="manifesto" aria-label={plain}>
      {tokens.map((t, i) => {
        const range = [i / n, Math.min(1, (i + 2.5) / n)]
        return (
          <span key={i} aria-hidden="true">
            <Word range={range} progress={scrollYProgress} still={still} className={t.em ? 'manifesto__em' : undefined}>
              {t.chip ? <Chip kind={t.chip} /> : t.w}
            </Word>{' '}
          </span>
        )
      })}
    </p>
  )
}

export default function About() {
  return (
    <section id="about" className="section section--bone about" aria-label="About">
      <div className="container">
        <Scramble as="p" className="about__label mono" text="00 — About / the short version" />
        <Manifesto />
        <div className="about__grid">
          <Reveal className="about__portrait">
            <Portrait />
          </Reveal>
          <div className="about__facts">
            <Reveal>
              <p className="about__intro">
                I like problems with <em>a clock attached</em> — scores that must arrive in order, payments that must happen exactly
                once, tickets that must work offline at a jetty with no signal.
              </p>
            </Reveal>
            <dl className="facts">
              {FACTS.map((f, i) => (
                <Reveal key={f.k} delay={0.05 * i} className="facts__row">
                  <dt className="mono">{f.k}</dt>
                  <dd>{f.v}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
