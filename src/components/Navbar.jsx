import { useEffect, useRef, useState } from 'react'
import { HiMenu, HiX } from 'react-icons/hi'

const links = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Work' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('about')
  const [pill, setPill] = useState({ left: 0, width: 0, opacity: 0 })
  const [menuOpen, setMenuOpen] = useState(false)
  const linkRefs = useRef({})

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on scroll
  useEffect(() => {
    const onScroll = () => { if (menuOpen) setMenuOpen(false) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [menuOpen])

  // Active section detector
  useEffect(() => {
    const sections = links.map((l) => document.querySelector(l.href)).filter(Boolean)
    if (!sections.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  // Position the active pill
  useEffect(() => {
    const el = linkRefs.current[active]
    if (!el) return setPill((p) => ({ ...p, opacity: 0 }))
    const parent = el.parentElement
    const parentRect = parent.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    setPill({ left: rect.left - parentRect.left, width: rect.width, opacity: 1 })
  }, [active])

  const handleHover = (id) => {
    const el = linkRefs.current[id]
    if (!el) return
    const parent = el.parentElement
    const parentRect = parent.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    setPill({ left: rect.left - parentRect.left, width: rect.width, opacity: 1 })
  }
  const handleLeave = () => {
    const el = linkRefs.current[active]
    if (!el) return
    const parent = el.parentElement
    const parentRect = parent.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    setPill({ left: rect.left - parentRect.left, width: rect.width, opacity: 1 })
  }

  return (
    <>
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <a href="#top" className="nav-logo" onClick={() => setMenuOpen(false)}>
          <span className="dot" /> Manisha
        </a>
        <div className="nav-links" onMouseLeave={handleLeave}>
          <span
            className="nav-pill"
            style={{
              transform: `translateX(${pill.left}px)`,
              width: pill.width,
              opacity: pill.opacity,
            }}
          />
          {links.map((l) => {
            const id = l.href.slice(1)
            return (
              <a
                key={l.href}
                href={l.href}
                ref={(el) => (linkRefs.current[id] = el)}
                onMouseEnter={() => handleHover(id)}
                className={active === id ? 'active' : ''}
              >
                {l.label}
              </a>
            )
          })}
        </div>
        <a href="#contact" className="nav-cta">Contact →</a>
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <HiX /> : <HiMenu />}
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu" role="navigation" aria-label="Mobile navigation">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="#contact" className="mobile-menu-cta" onClick={() => setMenuOpen(false)}>
            Contact
          </a>
        </div>
      )}
    </>
  )
}
