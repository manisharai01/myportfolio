import { useEffect, useLayoutEffect, useRef } from 'react'
import { onReady } from '../lib/boot'

/**
 * Variable-font name. Letters near the pointer stretch (wdth) and thicken (wght);
 * the rest of the line squeezes to compensate, so the line keeps its width.
 * Idle → one slow wave rolls through every few seconds, then everything rests.
 *
 * Perf: re-shaping 300px glyphs is the expensive part, so values are quantised
 * and the DOM is only touched when a letter's rounded axes actually change.
 */
const BASE_W = 92
const BASE_G = 780
const MIN_W = 52
const MAX_W = 150
const WAVE_MS = 2600
const WAVE_EVERY = 7000

export default function KineticName({ lines, className = '', fitHeight = false, as: Tag = 'h1' }) {
  const rootRef = useRef(null)
  const state = useRef({ letters: [], lines: [], fs: 100 })
  const linesKey = lines.map((l) => `${l.text}:${l.align ?? ''}`).join('|')

  // Fit the first line to the container width (and optionally the parent's height).
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const fit = () => {
      root.classList.add('is-measuring')
      root.style.setProperty('--kn-fs', '100px')
      const natural = root.querySelector('.kn__word').getBoundingClientRect().width
      const avail = root.clientWidth
      let fs = Math.max(40, (100 * avail) / natural) * 0.995
      if (fitHeight && window.matchMedia('(min-width: 1000px)').matches) {
        const h = root.parentElement.clientHeight
        if (h > 0) fs = Math.max(40, Math.min(fs, h / (lines.length * 0.8 + 0.04)))
      }
      root.style.setProperty('--kn-fs', `${fs}px`)
      state.current.fs = fs
      const rr = root.getBoundingClientRect()
      const prev = state.current.letters
      state.current.letters = [...root.querySelectorAll('.kn__l')].map((el, i) => {
        const r = el.getBoundingClientRect()
        const old = prev[i]
        return {
          el,
          line: +el.dataset.line,
          cx: r.left - rr.left + r.width / 2,
          cy: r.top - rr.top + r.height / 2,
          adv: r.width,
          w: old?.w ?? MIN_W,
          g: old?.g ?? 120,
          fvs: old?.fvs ?? '',
          o: old?.o ?? '',
          t: old?.t ?? '',
        }
      })
      // per-line extents for the idle wave
      state.current.lines = lines.map((_, li) => {
        const ls = state.current.letters.filter((l) => l.line === li)
        return { min: ls[0]?.cx ?? 0, max: ls[ls.length - 1]?.cx ?? 0, idx: state.current.letters.flatMap((l, i) => (l.line === li ? [i] : [])) }
      })
      root.classList.remove('is-measuring')
    }
    fit()
    document.fonts?.ready.then(fit)
    const ro = new ResizeObserver(fit)
    ro.observe(root)
    if (fitHeight) ro.observe(root.parentElement)
    window.addEventListener('mr:fonts', fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('mr:fonts', fit)
    }
  }, [fitHeight, linesKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const root = rootRef.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      root.classList.add('is-static')
      return
    }

    const pointer = { x: -9999, y: -9999, last: -1e9 }
    const onMove = (e) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.last = performance.now()
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    // The entrance plays once the curtain is up AND the headline is actually on screen.
    let introAt = null
    let waveAt = Infinity
    let booted = false
    let visible = false
    const startIntro = () => {
      if (introAt !== null || !booted || !visible) return
      introAt = performance.now() + 120
      waveAt = introAt + 3200
    }
    const off = onReady(() => {
      booted = true
      startIntro()
    })

    const write = (L, introP) => {
      const e = 1 - Math.pow(2, -10 * introP)
      const fvs = `"wdth" ${Math.round(L.w)}, "wght" ${Math.round(L.g / 10) * 10}`
      if (fvs !== L.fvs) {
        L.el.style.fontVariationSettings = fvs
        L.fvs = fvs
      }
      const o = introP === 0 ? '0' : Math.min(1, e * 1.4).toFixed(2)
      if (o !== L.o) {
        L.el.style.opacity = o
        L.o = o
      }
      const t = `translate3d(0, ${((1 - e) * 0.42).toFixed(3)}em, 0)`
      if (t !== L.t) {
        L.el.style.transform = t
        L.t = t
      }
    }

    let raf = 0
    let running = false
    const tick = (now) => {
      const { letters, lines: ext, fs } = state.current
      if (letters.length) {
        const active = now - pointer.last < 2500
        let mode = 'rest'
        let wp = 0
        let rr = null
        if (active) {
          mode = 'pointer'
          rr = root.getBoundingClientRect()
          waveAt = now + WAVE_EVERY
        } else if (now >= waveAt) {
          wp = (now - waveAt) / WAVE_MS
          if (wp <= 1) mode = 'wave'
          else waveAt = now + WAVE_EVERY - WAVE_MS
        }

        const sigma = fs * 0.85
        const tw = new Array(letters.length)
        const tg = new Array(letters.length)
        letters.forEach((L, i) => {
          let inf = 0
          if (mode === 'pointer') {
            const dx = pointer.x - rr.left - L.cx
            const dy = (pointer.y - rr.top - L.cy) * 1.35
            inf = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma))
          } else if (mode === 'wave') {
            const line = ext[L.line]
            const px = line.min + (line.max - line.min) * wp
            const dx = px - L.cx
            inf = Math.exp(-(dx * dx) / (2 * sigma * sigma)) * 0.6 * Math.sin(Math.PI * wp)
          }
          tw[i] = BASE_W + (MAX_W - BASE_W) * inf
          tg[i] = BASE_G + 120 * inf
        })
        // keep each line's width roughly constant
        ext.forEach(({ idx }) => {
          const sumAdv = idx.reduce((s, i) => s + letters[i].adv, 0) || 1
          const mean = idx.reduce((s, i) => s + letters[i].adv * tw[i], 0) / sumAdv
          const k = BASE_W / mean
          idx.forEach((i) => { tw[i] = Math.min(MAX_W, Math.max(MIN_W, tw[i] * k)) })
        })

        letters.forEach((L, i) => {
          const introP = introAt === null ? 0 : Math.min(1, Math.max(0, (now - introAt - i * 70) / 1300))
          const e = 1 - Math.pow(2, -10 * introP)
          const targetW = introP < 1 ? MIN_W + (tw[i] - MIN_W) * e : tw[i]
          const targetG = introP < 1 ? 120 + (tg[i] - 120) * e : tg[i]
          const k = introP < 1 ? 0.35 : 0.14
          L.w += (targetW - L.w) * k
          L.g += (targetG - L.g) * k
          write(L, introP)
        })
      }
      if (running) raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      startIntro()
      if (e.isIntersecting && !running) {
        running = true
        raf = requestAnimationFrame(tick)
      } else if (!e.isIntersecting && running) {
        running = false
        cancelAnimationFrame(raf)
      }
    })
    io.observe(root)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      off()
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <Tag ref={rootRef} className={`kn ${className}`} aria-label={lines.map((l) => l.text).join(' ')}>
      {lines.map((line, li) => (
        <span key={li} className={`kn__line kn__line--${line.align ?? 'left'}`}>
          <span className="kn__word" aria-hidden="true">
            {[...line.text].map((ch, ci) => (
              <span key={ci} className={`kn__l ${ch === ' ' ? 'kn__sp' : ''}`} data-line={li}>
                {ch === ' ' ? ' ' : ch}
              </span>
            ))}
          </span>
        </span>
      ))}
    </Tag>
  )
}
