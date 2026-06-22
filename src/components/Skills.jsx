import { Reveal } from './Reveal.jsx'
import { SKILL_GROUPS } from '../data.js'

export default function Skills() {
  return (
    <section id="skills">
      <div className="container">
        <Reveal><span className="eyebrow">Toolbox</span></Reveal>
        <Reveal delay={0.05}>
          <h2 className="section-title">The stack I <em>work with</em>.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-sub">
            A curated set of languages, frameworks and tools I reach for every day.
          </p>
        </Reveal>

        <div className="skills-grid">
          {SKILL_GROUPS.map((group, i) => {
            const HeadIcon = group.icon
            return (
              <Reveal key={group.title} delay={i * 0.05}>
                <div className="skill-card">
                  <div className="skill-head">
                    <div className="skill-icon"><HeadIcon /></div>
                    <h4>{group.title}</h4>
                  </div>
                  <div className="skill-tags">
                    {group.items.map((it) => {
                      const Icon = it.icon
                      return (
                        <span key={it.name} className="skill-pill">
                          {Icon && <Icon />} {it.name}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
