import { useLayoutEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import ShaderField from './ShaderField.jsx'
import KineticName from './KineticName.jsx'
import Ticker from './Ticker.jsx'
import { ArrowDown, LiveTime, Magnetic } from './ui/Primitives.jsx'
import { useBootReady } from '../lib/boot'
import { scrollToTarget } from '../lib/scroll'
import { PROFILE, SIGNAL, TICKER } from '../data/content'
import './Hero.css'

const EASE = [0.16, 1, 0.3, 1]
const fade = (i) => ({
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 1.1, ease: EASE, delay: 0.35 + i * 0.08 } },
})

/**
 * On wide screens the copy sits in the pocket left of "RAI", under "MANISHA".
 * That pocket's size depends on how big the fitted name came out, so measure it:
 * widen the copy to the pocket, and step the copy down (drop the proof line, then
 * smaller type) until it fits — it must never run up into the name.
 */
function useCopyPocket(stageRef, copyRef) {
  useLayoutEffect(() => {
    const stage = stageRef.current
    const copy = copyRef.current
    if (!stage || !copy) return
    const wide = window.matchMedia('(min-width: 1000px)')
    const fit = () => {
      stage.classList.remove('is-tight', 'is-tighter')
      stage.style.removeProperty('--copy-w')
      const kn = stage.querySelector('.kn')
      const lines = stage.querySelectorAll('.kn__line')
      if (!wide.matches || !kn || lines.length < 2) return
      kn.classList.add('is-measuring') // the name's resting shape, not its mid-animation one
      const sr = stage.getBoundingClientRect()
      const rai = lines[1].querySelector('.kn__word').getBoundingClientRect()
      const room = sr.bottom - lines[0].getBoundingClientRect().bottom - 10
      kn.classList.remove('is-measuring')
      const gap = Math.max(28, sr.width * 0.03)
      stage.style.setProperty('--copy-w', `${Math.round(Math.max(300, Math.min(rai.left - sr.left - gap, 860)))}px`)
      if (copy.offsetHeight > room) {
        stage.classList.add('is-tight')
        if (copy.offsetHeight > room) stage.classList.add('is-tighter')
      }
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(stage)
    document.fonts?.ready.then(fit)
    window.addEventListener('mr:fonts', fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('mr:fonts', fit)
    }
  }, [stageRef, copyRef])
}

export default function Hero() {
  const ready = useBootReady()
  const stageRef = useRef(null)
  const copyRef = useRef(null)
  useCopyPocket(stageRef, copyRef)
  const go = (e, id) => {
    e.preventDefault()
    scrollToTarget(id)
  }

  return (
    <section className="hero" id="top" aria-label="Introduction">
      <ShaderField className="hero__field" />
      <div className="hero__inner container">
        <motion.ul className="hero__meta mono" initial="hidden" animate={ready ? 'show' : 'hidden'}>
          <motion.li variants={fade(0)}>
            <span className="live-dot" /> {PROFILE.status}
          </motion.li>
          <motion.li variants={fade(1)}>Flutter · React Native · NestJS · Node</motion.li>
          <motion.li variants={fade(2)}>
            Gurugram, IN — <LiveTime className="hero__time" /> IST
          </motion.li>
          <motion.li variants={fade(3)} className="hero__meta-end">
            Portfolio — Ed. 2026
          </motion.li>
        </motion.ul>

        <div className="hero__stage" ref={stageRef}>
          <KineticName fitHeight lines={[{ text: PROFILE.first.toUpperCase() }, { text: PROFILE.last.toUpperCase(), align: 'right' }]} />
          <motion.div className="hero__copy" ref={copyRef} initial="hidden" animate={ready ? 'show' : 'hidden'}>
            <motion.p className="hero__tagline" variants={fade(4)}>
              {PROFILE.tagline}
            </motion.p>
            <motion.p className="hero__lede" variants={fade(5)}>
              {PROFILE.lede}
            </motion.p>
            <motion.div className="hero__ctas" variants={fade(6)}>
              <Magnetic>
                <a className="btn btn--signal" href="#work" onClick={(e) => go(e, '#work')}>
                  See the work <ArrowDown />
                </a>
              </Magnetic>
              <Magnetic>
                <a className="btn btn--ghost" href="#contact" onClick={(e) => go(e, '#contact')}>
                  Get in touch
                </a>
              </Magnetic>
            </motion.div>
            <motion.p className="hero__proof mono" variants={fade(7)}>
              {SIGNAL.commits.toLocaleString('en-IN')} commits · {SIGNAL.repos} repos · 2 live store apps
            </motion.p>
          </motion.div>
        </div>
      </div>
      <Ticker items={TICKER} />
    </section>
  )
}
