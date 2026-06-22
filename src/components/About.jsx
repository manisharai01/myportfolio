import { Reveal } from './Reveal.jsx'
import { EDUCATION, PROFILE } from '../data.js'

export default function About() {
  return (
    <section id="about">
      <div className="container">
        <Reveal><span className="eyebrow">About</span></Reveal>
        <Reveal delay={0.05}>
          <h2 className="section-title">Designing software<br/>that feels <em>effortless</em>.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-sub">{PROFILE.tagline}</p>
        </Reveal>

        <div className="about-grid">
          <Reveal delay={0.05}>
            <div className="about-card">
              <h3>Hello — I'm <em>Manisha</em>.</h3>
              <p>
                A final-year B.Tech student in CSE (Data Science) and a Full Stack Developer who loves building
                products end-to-end. I currently work on a Flutter fintech app at TFM Global, ship React interfaces
                on the side, and explore Machine Learning whenever curiosity strikes. I care deeply about motion,
                clarity, and the small details that make software feel alive.
              </p>
            </div>
          </Reveal>

          <div className="edu-list">
            {EDUCATION.map((e, i) => (
              <Reveal key={e.title} delay={0.1 + i * 0.08}>
                <div className="edu-item">
                  <div className="row">
                    <h4>{e.title}</h4>
                    <span className="year">{e.year}</span>
                  </div>
                  <div className="school">{e.school}</div>
                  <span className="grade">{e.grade}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
