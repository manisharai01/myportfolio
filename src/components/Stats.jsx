import { Counter } from './Animated.jsx'
import { Reveal } from './Reveal.jsx'

const stats = [
  { n: 4, suffix: '+', label: 'Internships' },
  { n: 10, suffix: '+', label: 'Features Shipped' },
  { n: 25, suffix: '%', label: 'Avg. Perf Gain' },
  { n: 100, suffix: '%', label: 'On-time Delivery' },
]

export default function Stats() {
  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="stat">
                <div className="stat-num">
                  <Counter to={s.n} suffix={s.suffix} duration={1.4} />
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
