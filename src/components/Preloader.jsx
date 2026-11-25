import { useEffect, useRef, useState } from 'react'
import { markReady } from '../lib/boot'
import { useSignal } from '../lib/signal'
import './Preloader.css'

/**
 * First-visit boot sequence, printed in the same halftone as the portrait:
 *   1. a dot-matrix screen tunes in and counts 000 → 100 in giant halftone digits,
 *      a scan line sweeping through them in signal orange;
 *   2. the digits re-form into the MR monogram;
 *   3. the dots turn into holes that open from the centre outwards — a halftone
 *      dissolve that reveals the hero as its name animates in underneath.
 * Skipped for reduced motion and after the first visit in a session.
 */

const LOG = [
  { at: 4, t: '00.04', k: 'opening uplink', v: 'gurugram · in' },
  { at: 24, t: '00.31', k: 'handshake', v: 'socket open' },
  { at: 46, t: '00.62', k: 'syncing commits', v: (s) => s.commits.toLocaleString('en-IN') }, // live count
  { at: 68, t: '00.97', k: 'seating judges', v: 'E · H · C · M · B' },
  { at: 90, t: '01.28', k: 'all systems', v: 'nominal' },
]

const INK = '#0b0a09'
const BONE = '#ede8df'
const HOT = '#ff4d1a'
const COUNT_MS = 1650
const MORPH_MS = 560
const EXIT_MS = 950
const MONO = '"Martian Mono Variable", ui-monospace, Menlo, monospace'
const DISPLAY = '"Anybody Variable", "Arial Black", Impact, sans-serif'

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const smooth = (t) => t * t * (3 - 2 * t)
const clamp01 = (t) => Math.min(1, Math.max(0, t))

function shouldSkip() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
  try {
    return sessionStorage.getItem('mr:booted') === '1'
  } catch {
    return false
  }
}

export default function Preloader() {
  const [skip] = useState(shouldSkip)
  const [open, setOpen] = useState(!skip)
  const [lit, setLit] = useState(0)
  const signal = useSignal()
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const countRef = useRef(null)
  const barRef = useRef(null)

  useEffect(() => {
    if (skip) {
      markReady()
      return
    }
    const html = document.documentElement
    html.classList.add('is-booting')
    const wrap = rootRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const mask = document.createElement('canvas')
    const mctx = mask.getContext('2d', { willReadFrequently: true })
    const substrate = document.createElement('canvas')
    const sctx = substrate.getContext('2d')
    const MS = 3 // mask scale: one mask pixel per 3 css px

    let W = 0
    let H = 0
    let cell = 12
    let maxR = 6
    let dots = []
    let cx = 0
    let cy = 0
    let dMax = 1
    let shown = null // what the mask currently holds: a number or 'MR'
    let fontsOk = false
    let phase = 'count'
    let tPhase = 0
    let litNow = 0
    let raf = 0
    let finished = false
    let start = 0 // set on the first painted frame, so a slow first load doesn't eat the count

    const fontTimer = setTimeout(() => (fontsOk = true), 3200)
    const loads = document.fonts?.load ? [document.fonts.load(`800 100px ${MONO}`), document.fonts.load(`800 100px ${DISPLAY}`)] : []
    Promise.all(loads).then(
      () => {
        fontsOk = true
        shown = null // re-rasterise with the real faces
      },
      () => (fontsOk = true)
    )

    const layout = () => {
      W = window.innerWidth
      H = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cell = Math.max(8, Math.min(18, Math.round(Math.min(W, H) / 60)))
      maxR = cell * 0.52
      const rowH = cell * 0.866
      const cols = Math.ceil(W / cell) + 2
      const rows = Math.ceil(H / rowH) + 2
      const prev = dots
      dots = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({ x: c * cell + (r % 2 ? cell / 2 : 0) - cell / 2, y: r * rowH, r: 0, tr: 0, d: Math.random() })
        }
      }
      if (prev.length === dots.length) dots.forEach((p, i) => (p.r = prev[i].r))
      cx = W / 2
      cy = H * 0.46
      dMax = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy))
      mask.width = Math.ceil(W / MS)
      mask.height = Math.ceil(H / MS)
      // the faint dot-matrix "screen" never changes, so draw it once
      substrate.width = canvas.width
      substrate.height = canvas.height
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sctx.fillStyle = 'rgba(237, 232, 223, 0.085)'
      sctx.beginPath()
      for (const p of dots) {
        sctx.moveTo(p.x + 0.85, p.y)
        sctx.arc(p.x, p.y, 0.85, 0, Math.PI * 2)
      }
      sctx.fill()
      shown = null
    }

    // WebKit draws variable fonts on canvas at their default (hairline) instance whatever
    // weight you ask for. Detect that by comparing ink at 100 vs 800, and embolden with a
    // stroke instead, so iPhones get the same chunky digits as everyone else.
    const weightWorks = {}
    const heavy = (fam) => {
      if (fam in weightWorks) return weightWorks[fam]
      const c = document.createElement('canvas')
      c.width = c.height = 120
      const x = c.getContext('2d', { willReadFrequently: true })
      const ink = (w) => {
        x.clearRect(0, 0, 120, 120)
        x.font = `${w} 80px ${fam}`
        x.fillStyle = '#fff'
        x.textBaseline = 'top'
        x.fillText('0', 10, 10)
        const d = x.getImageData(0, 0, 120, 120).data
        let n = 0
        for (let i = 3; i < d.length; i += 4) if (d[i] > 128) n++
        return n
      }
      const ok = ink(800) > ink(100) * 1.25
      if (fontsOk) weightWorks[fam] = ok // only trust the answer once the real faces are in
      return ok
    }
    const draw = (text, x, y, fs, fam, boost) => {
      if (!heavy(fam)) {
        mctx.lineJoin = 'round'
        mctx.strokeStyle = '#fff'
        mctx.lineWidth = fs * boost
        mctx.strokeText(text, x, y)
      }
      mctx.fillText(text, x, y)
    }

    // Rasterise digits or the monogram into a small mask, then give every dot a target radius.
    const raster = (what) => {
      const mw = mask.width
      const mh = mask.height
      mctx.setTransform(1, 0, 0, 1, 0, 0)
      mctx.clearRect(0, 0, mw, mh)
      mctx.fillStyle = '#fff'
      mctx.textAlign = 'center'
      mctx.textBaseline = 'alphabetic'
      if (what === 'MR') {
        mctx.font = `800 100px ${DISPLAY}`
        const m = mctx.measureText('MR')
        const capH = (m.actualBoundingBoxAscent || 72) / 100
        const fs = Math.min((mw * 0.8) / (m.width / 100), (mh * 0.5) / capH)
        mctx.font = `800 ${fs}px ${DISPLAY}`
        draw('MR', mw / 2, cy / MS + (capH * fs) / 2, fs, DISPLAY, 0.13)
      } else {
        const s = String(what).padStart(3, '0')
        mctx.font = `800 100px ${MONO}`
        const m = mctx.measureText('0')
        const capH = (m.actualBoundingBoxAscent || 72) / 100
        const fs = Math.min((mw * 0.88) / (3 * (m.width / 100)), (mh * 0.46) / capH)
        mctx.font = `800 ${fs}px ${MONO}`
        const slot = (m.width / 100) * fs
        for (let i = 0; i < 3; i++) draw(s[i], mw / 2 + (i - 1) * slot, cy / MS + (capH * fs) / 2, fs, MONO, 0.1)
      }
      const data = mctx.getImageData(0, 0, mw, mh).data
      for (const p of dots) {
        const mx = Math.round(p.x / MS)
        const my = Math.round(p.y / MS)
        let a = 0
        for (let oy = -1; oy <= 1; oy++) {
          const yy = my + oy
          if (yy < 0 || yy >= mh) continue
          for (let ox = -1; ox <= 1; ox++) {
            const xx = mx + ox
            if (xx < 0 || xx >= mw) continue
            a += data[(yy * mw + xx) * 4 + 3]
          }
        }
        p.tr = (a / (9 * 255)) * maxR
      }
      shown = what
    }

    const finish = () => {
      if (finished) return
      finished = true
      setOpen(false)
    }

    const frame = (now) => {
      if (!start) start = now
      const t = now - start
      if (phase === 'count') {
        const p = Math.min(1, t / COUNT_MS)
        const value = Math.round(easeInOut(p) * 100)
        if (shown !== value) raster(value)
        if (countRef.current) countRef.current.textContent = String(value).padStart(3, '0')
        if (barRef.current) barRef.current.style.transform = `scaleX(${value / 100})`
        const l = LOG.filter((x) => value >= x.at).length
        if (l !== litNow) {
          litNow = l
          setLit(l)
        }
        if (p >= 1 && fontsOk) {
          phase = 'morph'
          tPhase = now
          try {
            sessionStorage.setItem('mr:booted', '1')
          } catch {
            /* private mode */
          }
          markReady() // the hero's name starts forming underneath, so the dissolve reveals it mid-motion
        }
      } else if (phase === 'morph') {
        if (shown !== 'MR') raster('MR')
        if (now - tPhase >= MORPH_MS) {
          phase = 'exit'
          tPhase = now
          wrap.classList.add('is-leaving') // the canvas now paints the ink itself, so it can punch holes
          html.classList.remove('is-booting')
        }
      }

      const te = phase === 'exit' ? Math.min(1, (now - tPhase) / EXIT_MS) : 0
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, W, H)
      if (phase === 'exit') {
        // from the first exit frame on, the container is transparent — the canvas is the curtain
        ctx.fillStyle = INK
        ctx.fillRect(0, 0, W, H)
      }
      ctx.drawImage(substrate, 0, 0, W, H)

      const scanY = ((t % 1400) / 1400) * H * 1.4 - H * 0.2
      const band = cell * 3.2
      const k = phase === 'count' ? 0.34 : 0.14
      const bone = new Path2D()
      const hot = new Path2D()
      const holes = new Path2D()
      for (const p of dots) {
        p.r += (p.tr - p.r) * k
        let r = p.r
        if (te > 0) {
          const dist = Math.hypot(p.x - cx, p.y - cy) / dMax
          const o = smooth(clamp01(te * 1.7 - dist * 0.7 - p.d * 0.08))
          const rh = o * cell * 0.64
          if (rh > 0.2) {
            holes.moveTo(p.x + rh, p.y)
            holes.arc(p.x, p.y, rh, 0, Math.PI * 2)
          }
          r *= 1 - o
        }
        if (r < 0.4) continue
        const heat = Math.exp(-(((p.y - scanY) / band) ** 2))
        const rr = r * (1 + heat * 0.22)
        const path = heat > 0.5 ? hot : bone
        path.moveTo(p.x + rr, p.y)
        path.arc(p.x, p.y, rr, 0, Math.PI * 2)
      }
      if (te > 0) {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fill(holes)
        ctx.globalCompositeOperation = 'source-over'
      }
      ctx.fillStyle = BONE
      ctx.fill(bone)
      ctx.fillStyle = HOT
      ctx.fill(hot)

      if (te >= 1) return finish()
      raf = requestAnimationFrame(frame)
    }

    layout()
    raf = requestAnimationFrame(frame)
    const onResize = () => {
      layout()
      if (phase !== 'count') raster('MR')
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(fontTimer)
      window.removeEventListener('resize', onResize)
      html.classList.remove('is-booting')
    }
  }, [skip])

  if (!open) return null
  return (
    <div className="boot" ref={rootRef} aria-hidden="true">
      <canvas ref={canvasRef} className="boot__dots" />
      <div className="boot__hud">
        <div className="boot__top mono">
          <span>
            <span className="live-dot" /> Manisha Rai — Portfolio
          </span>
          <span className="boot__ed">Ed. 2026 · Gurugram, IN</span>
        </div>
        <div className="boot__bottom">
          <ul className="boot__log mono">
            {LOG.map((l, i) => (
              <li key={l.k} className={i < lit ? 'is-on' : ''}>
                <span className="boot__t">[{l.t}]</span>
                <span>{l.k}</span>
                <span className="boot__dots-line" />
                <span className="boot__v">{typeof l.v === 'function' ? l.v(signal) : l.v}</span>
              </li>
            ))}
          </ul>
          <p className="boot__count mono">
            <span ref={countRef}>000</span>
            <span className="boot__of">/100</span>
          </p>
        </div>
      </div>
      <div className="boot__bar" ref={barRef} />
    </div>
  )
}
