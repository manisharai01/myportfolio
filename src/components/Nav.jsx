import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { NAV, PROFILE } from '../data/content'
import { scrollToTarget, startScroll, stopScroll } from '../lib/scroll'
import { GitHubIcon, LinkedInIcon, Magnetic } from './ui/Primitives.jsx'
import CommandPalette from './CommandPalette.jsx'
import './Nav.css'

const EASE = [0.76, 0, 0.24, 1]

function useActiveSection() {
  const [active, setActive] = useState('')
  useEffect(() => {
    const ids = NAV.map((n) => n.href.slice(1))
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )
    els.forEach((el) => io.observe(el))
    const onTop = () => window.scrollY < window.innerHeight * 0.5 && setActive('')
    window.addEventListener('scroll', onTop, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onTop)
    }
  }, [])
  return active
}

export default function Nav() {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  const [palette, setPalette] = useState(false)
  const active = useActiveSection()
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 40)
    if (menu || palette) return
    if (y > 320 && y > prev + 4) setHidden(true)
    else if (y < prev - 4) setHidden(false)
  })

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!menu) return
    stopScroll()
    const onKey = (e) => e.key === 'Escape' && setMenu(false)
    window.addEventListener('keydown', onKey)
    return () => {
      startScroll()
      window.removeEventListener('keydown', onKey)
    }
  }, [menu])

  const go = (e, href) => {
    e.preventDefault()
    setMenu(false)
    startScroll() // the open menu stops Lenis, and a stopped Lenis ignores scrollTo
    scrollToTarget(href === '#top' ? 0 : href)
  }

  const slide = { y: hidden ? '-140%' : '0%' }
  const slideT = { duration: 0.6, ease: [0.16, 1, 0.3, 1] }

  return (
    <>
      {/* Own fixed layer so difference-blending sees the page (a fixed parent would isolate it). */}
      <motion.a
        href="#top"
        className="brand"
        onClick={(e) => go(e, '#top')}
        aria-label="Manisha Rai — back to top"
        animate={slide}
        transition={slideT}
      >
        <span className="brand__mark">MR</span>
        <span className="brand__name mono">Manisha Rai — full-stack</span>
      </motion.a>

      <motion.header className={`nav ${scrolled ? 'is-scrolled' : ''}`} animate={slide} transition={slideT}>
        <span aria-hidden="true" />

        <nav className="nav__links" aria-label="Primary">
          {NAV.map((l) => {
            const on = active === l.href.slice(1)
            return (
              <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)} className={on ? 'is-active' : ''} aria-current={on ? 'true' : undefined}>
                {on && <motion.span layoutId="nav-pill" className="nav__pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                <span className="nav__n mono">{l.n}</span>
                <span className="nav__label">{l.label}</span>
              </a>
            )
          })}
        </nav>

        <div className="nav__right">
          <Magnetic strength={0.25}>
            <a className="nav__cta mono" href="#contact" onClick={(e) => go(e, '#contact')}>
              <span className="live-dot live-dot--volt" /> Let’s talk
            </a>
          </Magnetic>
          <button className="nav__burger mono" onClick={() => setMenu(true)} aria-expanded={menu} aria-controls="mobile-menu">
            Menu
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            id="mobile-menu"
            className="mmenu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="mmenu__top">
              <span className="mono dim">Index</span>
              <button className="mono mmenu__close" onClick={() => setMenu(false)} autoFocus>
                Close ✕
              </button>
            </div>
            <ul className="mmenu__list">
              {[{ href: '#top', label: 'Home', n: '00' }, ...NAV].map((l, i) => (
                <li key={l.href} className="sw">
                  <motion.a
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 + i * 0.06 }}
                  >
                    <span className="mono">{l.n}</span>
                    {l.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <div className="mmenu__foot">
              <a className="mono" href={`mailto:${PROFILE.email}`}>
                {PROFILE.email}
              </a>
              <div className="mmenu__social">
                <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <LinkedInIcon width={20} height={20} />
                </a>
                <a href={PROFILE.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                  <GitHubIcon width={20} height={20} />
                </a>
                <span className="mono dim">Gurugram, IN</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </>
  )
}
