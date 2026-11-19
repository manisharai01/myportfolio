import './Ticker.css'

/** Stock-ticker tape of real numbers. Duplicated row → seamless loop. */
export default function Ticker({ items, className = '' }) {
  const row = (hidden) => (
    <div className="tk__row" aria-hidden={hidden || undefined}>
      {items.map((it, i) => (
        <span className="tk__item" key={i}>
          <span className="tk__k">{it.k}</span>
          <span className="tk__v">{it.v}</span>
          {it.d === 'up' && <span className="tk__up">▲</span>}
          {it.live && <span className="live-dot live-dot--volt" />}
          <span className="tk__sep">/</span>
        </span>
      ))}
    </div>
  )
  return (
    <div className={`tk mono ${className}`} role="marquee" aria-label="Highlights">
      <div className="tk__track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
