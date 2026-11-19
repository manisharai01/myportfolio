import { useEffect } from 'react'
import { MotionConfig, motion, useScroll, useSpring } from 'framer-motion'
import { destroyLenis, initLenis } from './lib/scroll'
import Preloader from './components/Preloader.jsx'
import Cursor from './components/Cursor.jsx'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Work from './components/Work.jsx'
import Signal from './components/Signal.jsx'
import Journey from './components/Journey.jsx'
import Toolbelt from './components/Toolbelt.jsx'
import Lab from './components/Lab.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import Toaster from './components/Toaster.jsx'

function ScrollMeter() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, mass: 0.3 })
  return <motion.div className="scroll-meter" style={{ scaleX }} aria-hidden="true" />
}

export default function App() {
  useEffect(() => {
    initLenis()
    return () => destroyLenis()
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Preloader />
      <Cursor />
      <Nav />
      <ScrollMeter />
      <main id="main">
        <Hero />
        <About />
        <Work />
        <Signal />
        <Journey />
        <Toolbelt />
        <Lab />
        <Contact />
      </main>
      <Footer />
      <Toaster />
      <div className="grain" aria-hidden="true" />
    </MotionConfig>
  )
}
