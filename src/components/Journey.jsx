import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { CERTS, JOURNEY } from '../data/content'
import { Reveal, SectionHead } from './ui/Primitives.jsx'
import './Journey.css'

// short, stable "commit hash" per entry — decoration only
const hash = (s) => {
  let h = 2166136261
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7)
}

export default function Journey() {
  const listRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 0.75', 'end 0.6'] })
  const grow = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })

  return (
    <section id="journey" className="section section--bone journey" aria-label="Journey">
      <div className="container">
        <SectionHead
          label="03 — Journey"
          title={['Intern to', 'owner']}
          aside="Under two years from IT intern to bootstrapping backends and owning production systems. Read it like a git log: newest first."
        />
        <div className="tl" ref={listRef}>
          <div className="tl__rail" aria-hidden="true">
            <motion.span className="tl__fill" style={{ scaleY: grow }} />
          </div>
          <ol>
            {JOURNEY.map((j, i) => (
              <motion.li
                key={j.role}
                className={`tl__item ${j.current ? 'is-current' : ''} ${j.edu ? 'is-edu' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              >
                <span className="tl__node" aria-hidden="true" />
                <div className="tl__when mono">
                  <span>{j.when}</span>
                  <span className="tl__hash">
                    {j.edu ? 'tag' : 'commit'} {hash(j.role + j.org)}
                    {i === 0 && <span className="tl__head"> (HEAD → main)</span>}
                  </span>
                </div>
                <div className="tl__main">
                  <h3 className="tl__role">{j.role}</h3>
                  <p className="tl__org">{j.org}</p>
                  <p className="tl__body">{j.body}</p>
                </div>
                <ul className="tl__tags">
                  {j.tags.map((t) => (
                    <li key={t} className="mono">
                      {t}
                    </li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </ol>
        </div>
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
