import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { HiArrowDown, HiArrowUpRight } from 'react-icons/hi2'
import { Magnetic } from './Animated.jsx'
import { PROFILE } from '../data.js'

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 220])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94])

  // Animated background blobs
  const blob1Y = useTransform(scrollYProgress, [0, 1], [0, -120])
  const blob2Y = useTransform(scrollYProgress, [0, 1], [0, 180])

  const word = {
    hidden: { y: '110%' },
    show: (i) => ({
      y: '0%',
      transition: { delay: 0.15 + i * 0.08, duration: 0.95, ease: [0.22, 1, 0.36, 1] },
    }),
  }
  const title = ['Hi,', "I'm", 'Manisha.']

  return (
    <section id="top" className="hero" ref={ref}>
      <div className="hero-grid" />
      <motion.div className="hero-bg" style={{ y, opacity }} />

      {/* Floating animated blobs */}
      <motion.div
        className="floating-blob blob-1"
        style={{ y: blob1Y }}
        animate={{ scale: [1, 1.15, 1], rotate: [0, 25, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="floating-blob blob-2"
        style={{ y: blob2Y }}
        animate={{ scale: [1, 1.2, 1], rotate: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div className="hero-inner" style={{ y, opacity, scale }}>
        <motion.div
          className="hero-tag"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
        >
          <span className="dot" /> Available for opportunities · 2026
        </motion.div>

        <h1 aria-label={title.join(' ')}>
          {title.map((w, i) => (
            <span key={i} style={{ overflow: 'hidden', display: 'inline-block', verticalAlign: 'top' }}>
              <motion.span
                style={{ display: 'inline-block' }}
                custom={i}
                variants={word}
                initial="hidden"
                animate="show"
                className={i === 2 ? 'serif shimmer-text' : ''}
              >
                {w}{i < title.length - 1 ? '\u00A0' : ''}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          className="hero-role"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.85 }}
        >
          <b>{PROFILE.role}</b> based in {PROFILE.location}, building delightful interfaces with React, Flutter & Python.
        </motion.p>

        <motion.div
          className="hero-cta"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.85 }}
        >
          <Magnetic strength={0.25}>
            <a href="#projects" className="btn btn-primary">
              View Projects <HiArrowUpRight />
            </a>
          </Magnetic>
          <Magnetic strength={0.25}>
            <a href="#contact" className="btn btn-ghost">Get in touch</a>
          </Magnetic>
        </motion.div>
      </motion.div>

      <motion.div
        className="scroll-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <span>Scroll</span>
        <span className="line" />
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <HiArrowDown />
        </motion.div>
      </motion.div>
    </section>
  )
}
