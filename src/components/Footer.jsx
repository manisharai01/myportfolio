import { NAV, PROFILE, SIGNAL } from '../data/content'
import { LiveTime } from './ui/Primitives.jsx'
import { scrollToTarget } from '../lib/scroll'
import './Footer.css'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const pretty = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

export default function Footer() {
  const go = (e, href) => {
    e.preventDefault()
    scrollToTarget(href === '#top' ? 0 : href)
  }
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__cols">
          <div>
            <p className="mono footer__k">Index</p>
            <ul>
              {NAV.map((n) => (
                <li key={n.href}>
                  <a href={n.href} onClick={(e) => go(e, n.href)}>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mono footer__k">Elsewhere</p>
            <ul>
              <li><a href={PROFILE.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
              <li><a href={PROFILE.github} target="_blank" rel="noreferrer">GitHub</a></li>
              <li><a href={`mailto:${PROFILE.email}`}>Email</a></li>
            </ul>
          </div>
          <div>
            <p className="mono footer__k">Status</p>
            <ul className="footer__status">
              <li><span className="live-dot live-dot--volt" /> {PROFILE.status}</li>
              <li>Gurugram — <LiveTime className="footer__time" /> IST</li>
              <li>Last commit — {pretty(SIGNAL.last)}</li>
            </ul>
          </div>
          <div>
            <p className="mono footer__k">Colophon</p>
            <p className="footer__colophon">
              Designed &amp; engineered from scratch — React, raw WebGL2 and four variable fonts (Anybody, Hanken Grotesk, Martian Mono,
              Fraunces). No templates.
            </p>
          </div>
        </div>
        <div className="footer__bar mono">
          <span>© {new Date().getFullYear()} {PROFILE.name}</span>
          <a href="#top" onClick={(e) => go(e, '#top')} className="footer__top">
            Back to top ↑
          </a>
        </div>
      </div>
      <div className="footer__mark" aria-hidden="true">
        <span>Manisha Rai</span>
      </div>
    </footer>
  )
}
