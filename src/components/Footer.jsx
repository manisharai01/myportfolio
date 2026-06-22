import { PROFILE } from '../data.js'

export default function Footer() {
  return (
    <footer className="footer">
      <div>
        © {new Date().getFullYear()} {PROFILE.name} — Designed & built with care.
      </div>
      <div className="footer-row">
        <a href={PROFILE.github} target="_blank" rel="noreferrer">GitHub</a>
        <span>·</span>
        <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        <span>·</span>
        <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
      </div>
    </footer>
  )
}
