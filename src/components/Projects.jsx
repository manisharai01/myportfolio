import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa'
import { Reveal } from './Reveal.jsx'
import { Tilt3D, Magnetic } from './Animated.jsx'
import { PROJECTS } from '../data.js'

export default function Projects() {
  return (
    <section id="projects">
      <div className="container">
        <Reveal><span className="eyebrow">Selected Work</span></Reveal>
        <Reveal delay={0.05}>
          <h2 className="section-title">Projects with <em>purpose</em>.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-sub">
            Hand-built apps that solve a real problem — accessibility, wellbeing, and beyond.
          </p>
        </Reveal>

        <div className="projects-grid">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <Tilt3D
                className={`project-card ${p.featured ? 'featured' : ''}`}
                max={6}
              >
                <article
                  className="project-card-inner"
                  style={{ '--card-accent': p.accent || 'var(--accent)' }}
                >
                  <div>
                    <div className="project-meta">
                      <span>{String(i + 1).padStart(2, '0')} · {p.year || 'Recent'}</span>
                      {p.featured && <span className="featured-badge">Featured</span>}
                    </div>
                    <h3>{p.name}</h3>
                    <p className="project-tagline">{p.tagline}</p>
                    {p.description && <p className="project-tagline">{p.description}</p>}
                    <ul>
                      {p.points.map((pt, idx) => <li key={idx}>{pt}</li>)}
                    </ul>
                  </div>

                  <div className="project-footer">
                    <div className="project-tech">
                      {(p.tech || []).map((t) => <span key={t} className="tech-pill">{t}</span>)}
                    </div>
                    <div className="project-links">
                      {p.repo && (
                        <Magnetic strength={0.3}>
                          <a className="project-link" href={p.repo} target="_blank" rel="noreferrer">
                            <FaGithub /> Code
                          </a>
                        </Magnetic>
                      )}
                      {p.live && (
                        <Magnetic strength={0.3}>
                          <a className="project-link" href={p.live} target="_blank" rel="noreferrer">
                            <FaExternalLinkAlt /> Live
                          </a>
                        </Magnetic>
                      )}
                    </div>
                  </div>
                </article>
              </Tilt3D>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
