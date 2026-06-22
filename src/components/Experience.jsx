import { Reveal } from './Reveal.jsx'
import { EXPERIENCE } from '../data.js'

export default function Experience() {
  return (
    <section id="experience">
      <div className="container">
        <Reveal><span className="eyebrow">Experience</span></Reveal>
        <Reveal delay={0.05}>
          <h2 className="section-title">A track record of<br/>shipping <em>real products</em>.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-sub">
            From FinTech mobile apps to enterprise IT — building, optimizing, and delivering on time.
          </p>
        </Reveal>

        <div className="timeline">
          {EXPERIENCE.map((e, i) => (
            <Reveal key={e.role + e.company} delay={i * 0.07}>
              <div className="exp-item">
                <div className="exp-card">
                  <div className="exp-head">
                    <h3>{e.role}</h3>
                    <span className="period">{e.period}</span>
                  </div>
                  <div className="exp-meta">{e.company} · {e.location}</div>
                  <ul>
                    {e.points.map((p, idx) => <li key={idx}>{p}</li>)}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
