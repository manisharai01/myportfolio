import { useEffect, useRef } from 'react'
import { onReady } from '../lib/boot'

/**
 * A living topographic map: contour lines of a domain-warped noise field.
 * The pointer bends the terrain into a gravity well and tints it "on air" red;
 * with no pointer around, the well drifts on autopilot so touch screens get it too.
 * Pure WebGL2, no libraries. Pauses off-screen; renders one still frame for
 * reduced-motion users; falls back to a CSS gradient without WebGL2.
 */

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform float uIntro;
uniform float uDensity;
uniform vec3 uInk;
uniform vec3 uLine;
uniform vec3 uSignal;
out vec4 outColor;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * snoise(p); p = p * 2.03 + vec2(13.7, 9.2); a *= 0.5; }
  return s;
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uRes.y;
  vec2 m = uMouse / uRes.y;
  float aspect = uRes.x / uRes.y;
  float t = uTime * 0.035;

  vec2 p = uv * 1.25;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(4.7, 1.9) - t * 0.8));
  float h = fbm(p + 1.3 * q + vec2(t * 0.5, -t * 0.3));

  float d = length(uv - m);
  float well = exp(-d * d * 7.5) * uHover;
  h += well * 0.62;
  h += sin(d * 46.0 - uTime * 2.2) * 0.012 * well;

  float v = h * uDensity;
  float fw = fwidth(v);
  float dist = abs(fract(v + 0.5) - 0.5);
  float minor = 1.0 - smoothstep(0.0, fw * 1.25, dist);
  float distM = abs(fract(v / 5.0 + 0.5) - 0.5) * 5.0;
  float major = 1.0 - smoothstep(0.0, fw * 1.9, distM);

  float scanY = fract(uTime * 0.05) * 1.6 - 0.3;
  float scan = exp(-pow((uv.y - scanY) * 9.0, 2.0));

  vec2 c = vec2(aspect * 0.5, 0.42);
  float rad = length(uv - c);
  float edge = uIntro * (aspect + 0.6);
  float reveal = 1.0 - smoothstep(edge - 0.35, edge, rad);

  float lineA = (minor * 0.09 + major * 0.2) * (1.0 + scan * 1.6) * reveal;
  float hot = clamp(well * 1.7, 0.0, 1.0);
  vec3 lc = mix(uLine, uSignal, hot);
  float a = clamp(lineA + hot * (minor * 0.5 + major * 0.45) * reveal, 0.0, 1.0);
  vec3 col = mix(uInk, lc, a);
  col += uSignal * well * 0.05 * reveal;

  vec2 vv = frag / uRes - 0.5;
  float vig = smoothstep(0.95, 0.15, length(vv * vec2(1.0, 1.25)));
  col = mix(uInk, col, 0.3 + 0.7 * vig);
  col = mix(uInk, col, smoothstep(0.0, 0.22, frag.y / uRes.y));

  col += (hash(frag + fract(uTime * 7.0) * 113.0) - 0.5) * 0.018;
  outColor = vec4(col, 1.0);
}`

const hex = (h) => {
  const n = parseInt(h.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export default function ShaderField({ className = '', density = 18, waitForBoot = true, signal = '#ff4d1a' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' })
    if (!gl) {
      canvas.dataset.fallback = 'true'
      return
    }

    const compile = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(s))
        return null
      }
      return s
    }
    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) {
      canvas.dataset.fallback = 'true'
      return
    }
    const prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const u = Object.fromEntries(
      ['uRes', 'uTime', 'uMouse', 'uHover', 'uIntro', 'uDensity', 'uInk', 'uLine', 'uSignal'].map((n) => [n, gl.getUniformLocation(prog, n)])
    )
    gl.uniform3fv(u.uInk, hex('#0b0a09'))
    gl.uniform3fv(u.uLine, hex('#ede8df'))
    gl.uniform3fv(u.uSignal, hex(signal))
    gl.uniform1f(u.uDensity, density)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Software rasterisers (no GPU) can't afford a full-res field: start small.
    const dbg = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : ''
    const software = /swiftshader|llvmpipe|software|basic render/i.test(renderer)
    const maxScale = software ? 0.5 : Math.min(window.devicePixelRatio || 1, 1.5)
    const minScale = 0.35
    let scale = maxScale
    let degraded = false
    let warmUntil = Infinity // don't judge performance while the page is still booting
    let slow = 0
    let quick = 0
    let w = 1, h = 1
    const resize = () => {
      const r = canvas.getBoundingClientRect()
      w = Math.max(1, Math.round(r.width * scale))
      h = Math.max(1, Math.round(r.height * scale))
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      gl.uniform2f(u.uRes, w, h)
      if (!running) draw(performance.now())
    }

    const pointer = { x: 0.5, y: 0.45, tx: 0.5, ty: 0.45, hover: 0, thover: 0, last: -1e9 }
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      const inside = e.clientY >= r.top && e.clientY <= r.bottom && e.clientX >= r.left && e.clientX <= r.right
      pointer.tx = (e.clientX - r.left) / r.width
      pointer.ty = 1 - (e.clientY - r.top) / r.height
      pointer.thover = inside ? 1 : 0
      pointer.last = performance.now()
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    let intro = waitForBoot ? 0 : 1
    let introStart = null
    const offBoot = onReady(() => {
      introStart = performance.now()
      warmUntil = introStart + 1600
      if (degraded) {
        introStart -= 10000
        draw(performance.now())
      }
    })
    if (!waitForBoot) {
      introStart = performance.now() - 5000
      warmUntil = performance.now() + 1600
    }

    const t0 = performance.now()
    let running = false
    let raf = 0
    let frames = 0
    let acc = 0
    let lastNow = t0

    function draw(now) {
      const time = (now - t0) / 1000
      // autopilot: a slow Lissajous drift when the pointer has been idle
      if (now - pointer.last > 2600) {
        pointer.tx = 0.5 + 0.32 * Math.sin(time * 0.23)
        pointer.ty = 0.5 + 0.22 * Math.sin(time * 0.31 + 1.2)
        pointer.thover = 0.75
      }
      pointer.x += (pointer.tx - pointer.x) * 0.06
      pointer.y += (pointer.ty - pointer.y) * 0.06
      pointer.hover += (pointer.thover - pointer.hover) * 0.04
      if (introStart !== null) intro = Math.min(1, (now - introStart) / 2400)
      const eased = 1 - Math.pow(1 - intro, 3)

      gl.uniform1f(u.uTime, reduce ? 18 : time)
      gl.uniform2f(u.uMouse, pointer.x * w, pointer.y * h)
      gl.uniform1f(u.uHover, pointer.hover)
      gl.uniform1f(u.uIntro, reduce ? 1 : eased)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    function frame(now) {
      // Adaptive resolution with hysteresis, judged in 30-frame windows after warm-up:
      // two slow windows → fewer pixels; three smooth windows → more pixels again;
      // still slow at the smallest size → freeze on a fully revealed still frame.
      const dt = Math.min(250, now - lastNow)
      lastNow = now
      if (now > warmUntil) {
        acc += dt
        frames++
      }
      if (frames === 30) {
        const avg = acc / frames
        frames = 0
        acc = 0
        slow = avg > 26 ? slow + 1 : 0
        quick = avg < 18.5 ? quick + 1 : 0
        if (slow >= 2 && scale > minScale + 0.01) {
          scale = Math.max(minScale, scale * 0.75)
          slow = 0
          resize()
        } else if (slow >= 2 && avg > 45) {
          degraded = true
          if (introStart !== null) introStart = now - 10000
        } else if (quick >= 3 && scale < maxScale - 0.01) {
          scale = Math.min(maxScale, scale * 1.2)
          quick = 0
          resize()
        }
      }
      draw(now)
      if (degraded) {
        running = false
        return
      }
      if (running) raf = requestAnimationFrame(frame)
    }

    let visible = true
    const sync = () => {
      const should = visible && !document.hidden && !reduce && !degraded
      if (should && !running) {
        running = true
        lastNow = performance.now()
        frames = 0
        acc = 0
        raf = requestAnimationFrame(frame)
      } else if (!should && running) {
        running = false
        cancelAnimationFrame(raf)
      }
    }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync() })
    io.observe(canvas)
    document.addEventListener('visibilitychange', sync)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    if (reduce) {
      pointer.hover = 0.6
      draw(performance.now())
    }

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      offBoot()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', sync)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buf)
    }
  }, [density, waitForBoot, signal])

  return <canvas ref={ref} className={`field ${className}`} aria-hidden="true" />
}
