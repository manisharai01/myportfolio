import { useState } from 'react'
import { TOOLBELT } from '../data/content'
import { Reveal, SectionHead } from './ui/Primitives.jsx'
import './Toolbelt.css'

/** Nudge a tooltip horizontally so it never leaves the viewport. */
function place(btn) {
  const tip = btn?.querySelector('.tb__where')
  if (!tip) return
  btn.style.setProperty('--tip-dx', '0px')
  const r = tip.getBoundingClientRect()
  const vw = document.documentElement.clientWidth
  const dx = r.left < 12 ? 12 - r.left : r.right > vw - 12 ? vw - 12 - r.right : 0
  btn.style.setProperty('--tip-dx', `${Math.round(dx)}px`)
}

export default function Toolbelt() {
  const [hot, setHot] = useState(null)
  const show = (id, btn) => {
    place(btn)
    setHot(id)
  }
  return (
    <section id="toolbelt" className="section toolbelt" aria-label="Toolbelt">
      <div className="container">
        <SectionHead label="— Toolbelt" title={['Tools I', 'reach for']} aside="Not a logo wall — hover (or tap) anything to see where I actually used it." />
        <div className="tb">
          {TOOLBELT.map((g, gi) => (
            <Reveal key={g.group} className="tb__row" delay={gi * 0.03}>
              <p className="tb__group mono">
                <span>{String(gi + 1).padStart(2, '0')}</span> {g.group}
              </p>
              <ul className="tb__items">
                {g.items.map((it) => {
                  const id = `${g.group}-${it.n}`
                  const on = hot === id
                  return (
                    <li key={it.n}>
                      <button
                        type="button"
                        className={`tb__item ${on ? 'is-on' : ''}`}
                        onPointerEnter={(e) => e.pointerType === 'mouse' && show(id, e.currentTarget)}
                        onPointerLeave={(e) => e.pointerType === 'mouse' && setHot(null)}
                        onFocus={(e) => show(id, e.currentTarget)}
                        onBlur={() => setHot(null)}
                        onClick={(e) => (on ? setHot(null) : show(id, e.currentTarget))}
                        aria-describedby={`${id}-where`}
                      >
                        <span className="tb__name" data-text={it.n}>
                          {it.n}
                        </span>
                        <span className="tb__where mono" id={`${id}-where`} role="tooltip">
                          {it.where}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
