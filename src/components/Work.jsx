import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ALSO, WORK } from '../data/content'
import { useMedia } from '../lib/hooks'
import { ArrowUpRight, Reveal, SectionHead } from './ui/Primitives.jsx'
import Departures from './visuals/Departures.jsx'
import Scoring from './visuals/Scoring.jsx'
import PhonePay from './visuals/PhonePay.jsx'
import Levels from './visuals/Levels.jsx'
import Health from './visuals/Health.jsx'
import './Work.css'
import './visuals/visuals.css'

const VISUALS = { departures: Departures, scoring: Scoring, phone: PhonePay, levels: Levels, health: Health }

/** `${w}x${h}` of the viewport, debounced — used to re-test whether stacked cards fit. */
function useViewportKey() {
  const get = () => `${window.innerWidth}x${window.innerHeight}`
  const [key, setKey] = useState(get)
  useEffect(() => {
    let t = 0
    const on = () => {
      clearTimeout(t)
      t = setTimeout(() => setKey(get()), 160)
    }
    window.addEventListener('resize', on)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', on)
    }
  }, [])
  return key
}

function WorkCard({ w, i, selfRef, nextRef, stacked }) {
  const Visual = VISUALS[w.visual]
  const reduce = useReducedMotion()
  const articleRef = useRef(null)

  // Stacked (tall desktop): recede only while the *next* card slides over this one.
  // layoutEffect:false → subscribe after commit, once the next sibling's ref is attached.
  const covered = stacked && !!nextRef
  const { scrollYProgress: cover } = useScroll({ target: nextRef ?? selfRef, offset: ['start end', 'start start'], layoutEffect: false })
  const scale = useTransform(cover, [0, 1], [1, covered ? 0.93 : 1])
  const shade = useTransform(cover, [0.3, 1], [0, covered ? 0.62 : 0])

  // Flowing cards (phones, tablets, short screens): deal in with a tilt + scale as they arrive.
  const { scrollYProgress: enter } = useScroll({ target: articleRef, offset: ['start end', 'start 0.5'] })
  const eScale = useTransform(enter, [0, 1], [0.9, 1])
  const eY = useTransform(enter, [0, 1], [90, 0])
  const eRot = useTransform(enter, [0, 1], [10, 0])
  const eOpacity = useTransform(enter, [0, 0.55], [0.25, 1])
  const { scrollYProgress: through } = useScroll({ target: articleRef, offset: ['start end', 'end start'] })
  const parallax = useTransform(through, [0, 1], [26, -26])

  const style = stacked
    ? { scale: covered ? scale : 1 }
    : reduce
      ? {}
      : { scale: eScale, y: eY, rotateX: eRot, opacity: eOpacity, transformPerspective: 1100 }

  return (
    <div ref={selfRef} className="wcard-wrap" style={{ '--i': i }}>
      <motion.article
        ref={articleRef}
        id={`work-${w.id}`}
        className="wcard"
        style={{ ...style, '--acc': w.accent, '--tint': w.tint }}
        aria-labelledby={`work-${w.id}-title`}
      >
        <div className="wcard__info">
          <div className="wcard__top">
            <span className="wcard__index mono">{w.index}</span>
            <span className="wcard__status mono">
              <span className="wcard__status-dot" /> {w.status}
            </span>
            <span className="wcard__years mono">{w.years}</span>
          </div>
          <p className="wcard__kicker mono">{w.kicker}</p>
          <h3 className="wcard__name" id={`work-${w.id}-title`}>
            {w.name}
          </h3>
          <p className="wcard__headline">{w.headline}</p>
          <p className="wcard__summary">{w.summary}</p>
          <p className="wcard__role">
            <span className="mono">My part</span> {w.role}
          </p>
          <dl className="wcard__metrics">
            {w.metrics.map((m) => (
              <div key={m.k}>
                <dt className="mono">{m.k}</dt>
                <dd>{m.v}</dd>
              </div>
            ))}
          </dl>
          {w.links && (
            <div className="wcard__links">
              {w.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="wcard__link mono" data-cursor="label" data-cursor-label="Open">
                  {l.label} <ArrowUpRight width={12} height={12} />
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="wcard__right">
          <motion.div className="wcard__visual" style={stacked || reduce ? undefined : { y: parallax }}>
            <Visual />
          </motion.div>
          <ul className="wcard__highlights">
            {w.highlights.map((h, k) => (
              <motion.li
                key={k}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.7, delay: k * 0.07, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="mono">{String(k + 1).padStart(2, '0')}</span>
                <p>{h}</p>
              </motion.li>
            ))}
          </ul>
          <ul className="wcard__stack" aria-label="Stack">
            {w.stack.map((s) => (
              <li key={s} className="chip">
                {s}
              </li>
            ))}
          </ul>
        </div>
        <motion.div className="wcard__shade" style={{ opacity: stacked ? shade : 0 }} aria-hidden="true" />
      </motion.article>
    </div>
  )
}

const STATUS = { live: 'Live', internal: 'Internal', shelved: 'Shelved' }

function More() {
  return (
    <div className="also">
      <Reveal>
        <p className="also__label mono">More work</p>
      </Reveal>
      <ul className="also__list">
        {ALSO.map((a, i) => (
          <Reveal as="li" key={a.name} delay={(i % 4) * 0.04} className={`also__row is-${a.status} ${a.href ? 'has-link' : ''}`}>
            <span className="also__name">
              {a.href ? (
                <a href={a.href} target="_blank" rel="noreferrer" className="also__hit" data-cursor="label" data-cursor-label="Visit">
                  {a.name}
                </a>
              ) : (
                a.name
              )}
            </span>
            <span className="also__what">{a.what}</span>
            <span className="also__stack mono">{a.stack}</span>
            <span className="also__meta mono">
              <span className={`also__status is-${a.status}`}>
                {a.status === 'live' && <span className="live-dot live-dot--volt" />} {STATUS[a.status]}
              </span>
              {a.href ? (
                <span className="also__link">
                  {a.linkLabel} <ArrowUpRight width={11} height={11} />
                </span>
              ) : (
                <span className="also__year">{a.year}</span>
              )}
            </span>
          </Reveal>
        ))}
      </ul>
    </div>
  )
}

export default function Work() {
  const stackRef = useRef(null)
  const refs = useMemo(() => WORK.map(() => ({ current: null })), [])
  const vpKey = useViewportKey()
  // Stack the cards only on wide, tall-enough screens, and only if every card's
  // content genuinely fits the sticky height — otherwise let them flow.
  const tallEnough = useMedia('(min-width: 1024px) and (min-height: 700px)')
  const [fits, setFits] = useState(true)
  useLayoutEffect(() => setFits(true), [vpKey])
  const stacked = tallEnough && fits

  useLayoutEffect(() => {
    if (!stacked) return
    const root = stackRef.current
    const overflowing = (el, slack = 2) => el && el.scrollHeight > el.clientHeight + slack
    const check = () => {
      for (const card of root.querySelectorAll('.wcard')) {
        if (
          overflowing(card.querySelector('.wcard__info')) ||
          overflowing(card.querySelector('.wcard__right')) ||
          overflowing(card.querySelector('.screen__body'), 6) ||
          overflowing(card.querySelector('.phone-stage'), 6)
        ) {
          setFits(false)
          return
        }
      }
    }
    check()
    document.fonts?.ready.then(check)
  }, [stacked, vpKey])

  return (
    <section id="work" className="section work" aria-label="Selected work">
      <div className="container">
        <SectionHead
          label="01 — Selected work"
          title={['Proof of', 'work']}
          aside="Five systems I built or owned end to end — from apps live on both stores to a complete platform built for a government tender. The visuals are rebuilt in code to show how each one behaves."
        />
      </div>
      <div ref={stackRef} className={`work__stack container ${stacked ? 'is-stacked' : 'is-flow'}`}>
        {WORK.map((w, i) => (
          <WorkCard key={w.id} w={w} i={i} selfRef={refs[i]} nextRef={refs[i + 1]} stacked={stacked} />
        ))}
      </div>
      <div className="container">
        <More />
      </div>
    </section>
  )
}
