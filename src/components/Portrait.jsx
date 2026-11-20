import { useEffect, useRef } from 'react'
import photo from '../assets/manisha.jpg'

/**
 * The portrait as a halftone print: one dot per cell, sized by darkness.
 * Dots scatter from the pointer and glow signal-red, then settle back.
 * A low-res source photo becomes a deliberate, crisp graphic at any size.
 */
export default function Portrait({ step = 6, className = '' }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const img = new Image()
    img.decoding = 'async'
    img.src = photo

    let dots = []
    let cssW = 0, cssH = 0
    let raf = 0
    let active = false
    let lastActive = 0
    let intro = reduce ? 1 : 0
    let introStart = null
    let dir = 1 // 1: dots swell in top → bottom (scrolling down), -1: bottom → top (scrolling up)
    const ptr = { x: -9999, y: -9999, inside: false }

    const build = () => {
      if (!img.complete || !img.naturalWidth) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
      cssW = wrap.clientWidth
      cssH = Math.round(cssW * (sh / sw))
      canvas.width = Math.round(cssW * dpr)
      canvas.height = Math.round(cssH * dpr)
      canvas.style.height = `${cssH}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const cols = Math.floor(cssW / step)
      const rows = Math.floor(cssH / (step * 0.866))
      const off = document.createElement('canvas')
      off.width = cols
      off.height = rows
      const octx = off.getContext('2d', { willReadFrequently: true })
      // progressive halving = proper area-averaging in every engine (one-step downscales alias in WebKit)
      let src = img, srcX = sx, srcY = sy, w = sw, h = sh
      while (w / 2 > cols * 1.5) {
        const nw = Math.round(w / 2)
        const nh = Math.round(h / 2)
        const tmp = document.createElement('canvas')
        tmp.width = nw
        tmp.height = nh
        const tctx = tmp.getContext('2d')
        tctx.imageSmoothingQuality = 'high'
        tctx.drawImage(src, srcX, srcY, w, h, 0, 0, nw, nh)
        src = tmp
        srcX = 0
        srcY = 0
        w = nw
        h = nh
      }
      octx.imageSmoothingQuality = 'high'
      octx.drawImage(src, srcX, srcY, w, h, 0, 0, cols, rows)
      const data = octx.getImageData(0, 0, cols, rows).data

      dots = []
      const smooth = (a, b, x) => {
        const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
        return t * t * (3 - 2 * t)
      }
      // luminance grid + unsharp mask, so glasses, eyes and lips survive the dot screen
      const L = new Float32Array(cols * rows)
      for (let k = 0; k < cols * rows; k++) {
        L[k] = (0.2126 * data[k * 4] + 0.7152 * data[k * 4 + 1] + 0.0722 * data[k * 4 + 2]) / 255
      }
      const B = new Float32Array(cols * rows)
      const R = 2
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let s = 0, n = 0
          for (let dy = -R; dy <= R; dy++) {
            const y = r + dy
            if (y < 0 || y >= rows) continue
            for (let dx = -R; dx <= R; dx++) {
              const x = c + dx
              if (x < 0 || x >= cols) continue
              s += L[y * cols + x]
              n++
            }
          }
          B[r * cols + c] = s / n
        }
      }
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const k = r * cols + c
          // sharpen mid/dark tones only — sharpening pale background would print halo lines
          const amt = 1.35 * (1 - smooth(0.55, 0.85, L[k]))
          let lum = L[k] + amt * (L[k] - B[k])
          lum = Math.min(1, Math.max(0, (lum - 0.05) / 0.78)) // levels: pale walls drop to paper
          // soft oval vignette keeps the eye on the face and fades busy corners
          const ex = (c / cols - 0.5) / 0.6
          const ey = (r / rows - 0.47) / 0.66
          const fade = 1 - smooth(0.82, 1.12, Math.hypot(ex, ey))
          const dark = Math.pow(1 - lum, 1.1) * fade
          if (dark < 0.06) continue
          const x = c * step + step / 2 + (r % 2 ? step / 2 : 0)
          const y = r * step * 0.866 + step / 2
          dots.push({ x, y, ox: 0, oy: 0, r: dark * step * 0.62, heat: 0, d: Math.random() })
        }
      }
      draw(performance.now())
    }

    const draw = (now) => {
      if (introStart !== null && intro < 1) intro = Math.min(1, (now - introStart) / 1600)
      ctx.clearRect(0, 0, cssW, cssH)
      let moving = false
      const R = 70
      for (const p of dots) {
        // intro: dots swell in along the scroll direction, with a little randomness
        const along = dir > 0 ? p.y / cssH : 1 - p.y / cssH
        const k = Math.min(1, Math.max(0, intro * 1.8 - along * 0.8 - p.d * 0.15))
        let tx = 0, ty = 0, th = 0
        if (ptr.inside) {
          const dx = p.x - ptr.x
          const dy = p.y - ptr.y
          const dist = Math.hypot(dx, dy)
          if (dist < R) {
            const f = 1 - dist / R
            const push = f * f * 16
            tx = (dx / (dist || 1)) * push
            ty = (dy / (dist || 1)) * push
            th = f
          }
        }
        p.ox += (tx - p.ox) * 0.18
        p.oy += (ty - p.oy) * 0.18
        p.heat += (th - p.heat) * 0.12
        if (Math.abs(tx - p.ox) > 0.05 || Math.abs(ty - p.oy) > 0.05 || p.heat > 0.01) moving = true
        const rad = p.r * k
        if (rad < 0.2) continue
        ctx.fillStyle = p.heat > 0.15 ? '#ff4d1a' : '#0b0a09'
        ctx.beginPath()
        ctx.arc(p.x + p.ox, p.y + p.oy, rad * (1 + p.heat * 0.25), 0, Math.PI * 2)
        ctx.fill()
      }
      return moving || (introStart !== null && intro < 1)
    }

    const loop = (now) => {
      const busy = draw(now)
      if (busy || ptr.inside || now - lastActive < 600) raf = requestAnimationFrame(loop)
      else active = false
    }
    const wake = () => {
      lastActive = performance.now()
      if (!active) {
        active = true
        raf = requestAnimationFrame(loop)
      }
    }

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      ptr.x = e.clientX - r.left
      ptr.y = e.clientY - r.top
      ptr.inside = true
      wake()
    }
    const onLeave = () => {
      ptr.inside = false
      wake()
    }
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)

    // Replays every time the portrait comes back on screen, from whichever edge it enters.
    const io = new IntersectionObserver(([e]) => {
      if (reduce) return
      if (!e.isIntersecting) {
        // fully off screen: blank it so the next entrance prints it again
        if (introStart !== null) {
          introStart = null
          intro = 0
          ptr.inside = false
          draw(performance.now())
        }
        return
      }
      if (e.intersectionRatio >= 0.25 && introStart === null) {
        dir = e.boundingClientRect.top >= 0 ? 1 : -1
        introStart = performance.now()
        wake()
      }
    }, { threshold: [0, 0.25] })
    io.observe(canvas)

    img.onload = build
    if (img.complete) build()
    const ro = new ResizeObserver(() => build())
    ro.observe(wrap)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [step])

  return (
    <figure className={`portrait ${className}`}>
      <div ref={wrapRef} className="portrait__frame" data-cursor="label" data-cursor-label="Hi!">
        <canvas ref={canvasRef} role="img" aria-label="Halftone portrait of Manisha Rai" />
        <span className="portrait__corner portrait__corner--tl" />
        <span className="portrait__corner portrait__corner--br" />
      </div>
      <figcaption className="mono">
        <span>Fig. 01 — The engineer</span>
        <span>Halftone · {step}px cell</span>
      </figcaption>
    </figure>
  )
}
