import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useSpring, useReducedMotion, animate } from 'framer-motion'
import { useClock } from '../../lib/hooks'

/** Ticking IST clock, isolated so only this span re-renders every second. */
export function LiveTime({ className }) {
  const t = useClock()
  return <span className={className}>{t}</span>
}

const EASE = [0.16, 1, 0.3, 1]

/** Words rise out of masks when the element scrolls into view. */
export function SplitReveal({ text, as: Tag = 'h2', className, delay = 0, stagger = 0.045, once = true }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once, margin: '0px 0px -12% 0px' })
  const lines = Array.isArray(text) ? text : [text]
  let i = 0
  return (
    <Tag ref={ref} className={className} aria-label={lines.join(' ')}>
      {lines.map((line, li) => (
        <span key={li} className="sr-line" aria-hidden="true" style={{ display: 'block' }}>
          {line.split(' ').map((w, wi, arr) => {
            const k = i++
            return (
              <span key={wi}>
                <span className="sw">
                  <motion.span
                    initial={{ y: '115%' }}
                    animate={inView ? { y: '0%' } : { y: '115%' }}
                    transition={{ duration: 1.05, ease: EASE, delay: delay + k * stagger }}
                  >
                    {w}
                  </motion.span>
                </span>
                {wi < arr.length - 1 ? ' ' : ''}
              </span>
            )
          })}
        </span>
      ))}
    </Tag>
  )
}

/** Fade + lift on enter. */
export function Reveal({ children, delay = 0, y = 28, className, as = 'div', amount = 0.2 }) {
  const Comp = motion[as] ?? motion.div
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </Comp>
  )
}

const GLYPHS = '!<>-_\\/[]{}=+*^?#%ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

/** Decodes monospace text from noise when it enters view. */
export function Scramble({ text, className, as: Tag = 'span', delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' })
  const reduce = useReducedMotion()
  const [out, setOut] = useState(reduce ? text : text.replace(/\S/g, ' '))

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setOut(text)
      return
    }
    let frame = 0
    let raf = 0
    const chars = [...text]
    const plan = chars.map((ch, i) => ({ ch, start: Math.floor(i * 0.9 + Math.random() * 5), end: Math.floor(i * 0.9 + 8 + Math.random() * 12) }))
    const timeout = setTimeout(() => {
      const tick = () => {
        let done = 0
        let s = ''
        for (const p of plan) {
          if (p.ch === ' ') { s += ' '; done++; continue }
          if (frame >= p.end) { s += p.ch; done++ }
          else if (frame >= p.start) s += GLYPHS[(Math.random() * GLYPHS.length) | 0]
          else s += ' '
        }
        setOut(s)
        frame++
        if (done < plan.length) raf = requestAnimationFrame(tick)
      }
      tick()
    }, delay * 1000)
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf) }
  }, [inView, text, delay, reduce])

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{out}</span>
    </Tag>
  )
}

/** Pulls its child toward the pointer. */
export function Magnetic({ children, strength = 0.35, className }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 16, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 200, damping: 16, mass: 0.6 })
  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => { x.set(0); y.set(0) }
  return (
    <motion.span ref={ref} className={className} style={{ x: sx, y: sy, display: 'inline-flex' }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.span>
  )
}

/** Counts up to `value` when visible. Keeps the final string's formatting.
 *  If `value` changes later (fresher stats), it rolls on from the number on screen. */
export function Counter({ value, duration = 1.8, className, prefix = '', suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  const target = Number(String(value).replace(/[^0-9.]/g, ''))
  const [n, setN] = useState(reduce ? target : 0)
  const shown = useRef(n)
  useEffect(() => {
    if (reduce) {
      shown.current = target
      setN(target)
      return
    }
    if (!inView) return
    const c = animate(shown.current, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        shown.current = v
        setN(v)
      },
    })
    return () => c.stop()
  }, [inView, target, duration, reduce])
  return (
    <span ref={ref} className={className}>
      {prefix}
      {Math.round(n).toLocaleString('en-IN')}
      {suffix}
    </span>
  )
}

/** Section heading: mono label + giant display title + optional aside. */
export function SectionHead({ label, title, aside, className = '' }) {
  return (
    <header className={`sec-head ${className}`}>
      <div>
        <Scramble as="p" className="sec-head__label mono" text={label} />
        <SplitReveal className="sec-head__title" text={title} />
      </div>
      {aside && (
        <Reveal className="sec-head__aside" delay={0.2}>
          <p>{aside}</p>
        </Reveal>
      )}
    </header>
  )
}

export const ArrowUpRight = (props) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" strokeLinecap="square" />
  </svg>
)
export const ArrowDown = (props) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>
    <path d="M8 2.5v11M3.5 9l4.5 4.5L12.5 9" strokeLinecap="square" />
  </svg>
)
export const CopyIcon = (props) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" {...props}>
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
    <path d="M10.5 3.5v-1h-8v8h1" />
  </svg>
)
export const GitHubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
)
export const LinkedInIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
)
