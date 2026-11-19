import { useLayoutEffect, useMemo, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ALSO, WORK } from '../data/content'
import { ArrowUpRight, Reveal, SectionHead } from './ui/Primitives.jsx'
import Departures from './visuals/Departures.jsx'
import Scoring from './visuals/Scoring.jsx'
import PhonePay from './visuals/PhonePay.jsx'
import Levels from './visuals/Levels.jsx'
import Health from './visuals/Health.jsx'
import './Work.css'
import './visuals/visuals.css'

const VISUALS = { departures: Departures, scoring: Scoring, phone: PhonePay, levels: Levels, health: Health }

/**
 * Stacking cards that work at every screen size:
 * each card publishes its height (--h), and CSS pins it with
 *   top: min(deck offset, 100svh − height)
 * so a card shorter than the screen sticks near the top like a deck, and a taller
 * card sticks by its bottom edge once you've read it. Either way the next card
 * slides over it, and nothing is ever cut off.
 */
function WorkCard({ w, i, selfRef, nextRef }) {
  const Visual = VISUALS[w.visual]
  const reduce = useReducedMotion()
  const articleRef = useRef(null)

  useLayoutEffect(() => {
    const art = articleRef.current
    const wrap = selfRef.current
    if (!art || !wrap) return
    const publish = () => wrap.style.setProperty('--h', `${art.offsetHeight}px`) // offsetHeight ignores transforms
    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(art)
    return () => ro.disconnect()
  }, [selfRef])

  // Recede only while the *next* card slides over this one.
  // layoutEffect:false → subscribe after commit, once the next sibling's ref is attached.
  const covered = !!nextRef && !reduce
  const { scrollYProgress: cover } = useScroll({ target: nextRef ?? selfRef, offset: ['start end', 'start start'], layoutEffect: false })
  const scale = useTransform(cover, [0, 1], [1, 0.93])
  const shade = useTransform(cover, [0.25, 1], [0, 0.6])

  return (
    <div ref={selfRef} className="wcard-wrap" style={{ '--i': i }}>
      <motion.article
        ref={articleRef}
        id={`work-${w.id}`}
        className="wcard"
        style={{ scale: covered ? scale : 1, '--acc': w.accent, '--tint': w.tint }}
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
          <div className="wcard__visual">
            <Visual />
          </div>
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
        <motion.div className="wcard__shade" style={{ opacity: covered ? shade : 0 }} aria-hidden="true" />
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
  const refs = useMemo(() => WORK.map(() => ({ current: null })), [])
  return (
    <section id="work" className="section work" aria-label="Selected work">
      <div className="container">
        <SectionHead
          label="01 — Selected work"
          title={['Proof of', 'work']}
          aside="Five systems I built or owned end to end — from apps live on both stores to a complete platform built for a government tender. The visuals are rebuilt in code to show how each one behaves."
        />
      </div>
      <div className="work__stack container">
        {WORK.map((w, i) => (
          <WorkCard key={w.id} w={w} i={i} selfRef={refs[i]} nextRef={refs[i + 1]} />
        ))}
      </div>
      <div className="container">
        <More />
      </div>
    </section>
  )
}
