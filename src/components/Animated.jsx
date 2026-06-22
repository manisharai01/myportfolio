import { useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Magnetic — element gently follows the cursor when nearby.
 * Wrap any clickable in <Magnetic>...</Magnetic>.
 */
export function Magnetic({ children, strength = 0.35, className }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 180, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 180, damping: 18, mass: 0.4 })

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    x.set((e.clientX - cx) * strength)
    y.set((e.clientY - cy) * strength)
  }
  const onLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy, display: 'inline-block' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Tilt3D — perspective tilt + glare on hover.
 */
export function Tilt3D({ children, className, max = 8 }) {
  const ref = useRef(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const px = useMotionValue(50)
  const py = useMotionValue(50)
  const srx = useSpring(rx, { stiffness: 200, damping: 22 })
  const sry = useSpring(ry, { stiffness: 200, damping: 22 })

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = (e.clientX - r.left) / r.width
    const dy = (e.clientY - r.top) / r.height
    ry.set((dx - 0.5) * max * 2)
    rx.set(-(dy - 0.5) * max * 2)
    px.set(dx * 100)
    py.set(dy * 100)
  }
  const onLeave = () => { rx.set(0); ry.set(0) }

  const glare = useTransform(
    [px, py],
    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.10), transparent 45%)`
  )

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: srx,
        rotateY: sry,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      className={className}
    >
      {children}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          background: glare,
          pointerEvents: 'none',
          borderRadius: 'inherit',
          mixBlendMode: 'overlay',
        }}
      />
    </motion.div>
  )
}

/**
 * SplitText — splits a string into characters that animate up.
 */
export function SplitText({ text, className, delay = 0, stagger = 0.025 }) {
  const chars = Array.from(text)
  return (
    <span className={className} aria-label={text}>
      {chars.map((ch, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: '110%' }}
            whileInView={{ y: '0%' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: delay + i * stagger, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {ch === ' ' ? '\u00A0' : ch}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

/**
 * Counter — eases a number up to `to` when in view.
 */
export function Counter({ to = 100, suffix = '', duration = 1.6, className }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        const start = performance.now()
        const tick = (now) => {
          const t = Math.min(1, (now - start) / (duration * 1000))
          const eased = 1 - Math.pow(1 - t, 3)
          el.textContent = Math.round(to * eased) + suffix
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        io.disconnect()
      })
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [to, suffix, duration])
  return <span ref={ref} className={className}>0{suffix}</span>
}
