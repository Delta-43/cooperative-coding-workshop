import { useEffect, useRef } from 'react'

export interface WaterProps {
  /** Height of the water surface, 0 (empty) to 1 (full). */
  level?: number
  /** How rough the surface is. 1 is calm, 3 is a splash. Changes ease in and out. */
  agitation?: number
  /** Air bubbles rising from the bottom. */
  bubbles?: boolean
  /** A stream pouring in from the top, splashing where it lands. */
  stream?: boolean
  /** Seconds to pour up to a new level. Without it the level eases in quickly. */
  fillSeconds?: number
  /** Change this value to make a splash, for example when water is poured in. */
  splashKey?: number | string
  /** Extra class for sizing; the canvas fills its parent. */
  className?: string
}

interface Bubble {
  x: number
  y: number
  r: number
  vy: number
  wobble: number
  phase: number
}

interface Drop {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

// Back to front: distant swell and mid water. The body of water we look into is drawn last.
const LAYERS = [
  { amp: 0.55, len: 1.5, speed: 0.45, offset: -0.12, top: 'rgba(214,240,250,0.9)', bottom: 'rgba(170,214,240,0.9)' },
  { amp: 0.8, len: 1.05, speed: -0.65, offset: -0.06, top: 'rgba(150,212,240,0.92)', bottom: 'rgba(92,168,226,0.92)' },
]
const BODY = { amp: 1.0, len: 0.8, speed: 0.95 }

const STEP = 4
const GRAVITY = 520
// Caustics are worked out at a third of the size and stretched; cells are about 90 px across.
const CAUSTIC_SCALE = 3
const CAUSTIC_CELL = 90
const TAU = Math.PI * 2

/**
 * Brightness of the caustic net at a point: light bent by a moving surface gathers
 * into thin bright lines. An iterated wave field, the usual water-shader approach.
 */
function causticAt(x: number, y: number, time: number): number {
  const px = ((x / CAUSTIC_CELL) * TAU) % TAU - 250
  const py = ((y / CAUSTIC_CELL) * TAU) % TAU - 250
  let ix = px
  let iy = py
  let c = 1
  const inten = 0.005
  for (let n = 0; n < 4; n++) {
    const tt = time * (1 - 3.5 / (n + 1))
    const nx = px + Math.cos(tt - ix) + Math.sin(tt + iy)
    const ny = py + Math.sin(tt - iy) + Math.cos(tt + ix)
    ix = nx
    iy = ny
    const ax = px / (Math.sin(ix + tt) / inten)
    const ay = py / (Math.cos(iy + tt) / inten)
    c += 1 / Math.sqrt(ax * ax + ay * ay)
  }
  c /= 4
  c = 1.17 - Math.pow(c, 1.4)
  return Math.min(1, Math.pow(Math.abs(c), 8))
}

const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Water drawn on a canvas: sharp-crested waves, colour that deepens with depth, a bright
 * surface band and meniscus, moving caustic light, bubbles, splash droplets that fall
 * under gravity, and an optional pouring stream. Used by the pond, the progress tube,
 * the phone beaker and the results glass.
 */
export function Water({
  level = 0.6,
  agitation = 1,
  bubbles = false,
  stream = false,
  fillSeconds,
  splashKey,
  className,
}: WaterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const target = useRef({ level, agitation, bubbles, stream, fillSeconds })
  const splash = useRef(0)
  useEffect(() => {
    target.current = { level, agitation, bubbles, stream, fillSeconds }
  }, [level, agitation, bubbles, stream, fillSeconds])
  const firstSplash = useRef(true)
  useEffect(() => {
    if (firstSplash.current) {
      firstSplash.current = false
      return
    }
    splash.current = 2.2
  }, [splashKey])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Caustics are worked out on a small canvas and stretched, which also softens them.
    const caustic = document.createElement('canvas')
    const cctx = caustic.getContext('2d')

    let width = 0
    let height = 0
    let causticImage: ImageData | null = null
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      caustic.width = Math.max(2, Math.ceil(width / CAUSTIC_SCALE))
      caustic.height = Math.max(2, Math.ceil(height / CAUSTIC_SCALE))
      causticImage = cctx ? cctx.createImageData(caustic.width, caustic.height) : null
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const still = reducedMotion()
    let level = target.current.fillSeconds ? 0 : target.current.level
    let agitation = target.current.agitation
    let bubbleList: Bubble[] = []
    let drops: Drop[] = []
    let last = performance.now()
    let t = Math.random() * 100
    let frame = 0

    // A wave with narrow crests and broad troughs, as wind-driven water has.
    const crest = (theta: number) => 2 * Math.pow((Math.sin(theta) + 1) / 2, 1.7) - 1

    const surfaceAt = (x: number, base: number, amp: number, len: number, speed: number) => {
      const k = (Math.PI * 2) / (Math.max(width, 200) * 0.5 * len)
      return (
        base -
        amp *
          (crest(x * k + t * speed) * 0.62 +
            crest(x * k * 2.1 - t * speed * 1.35 + 1.7) * 0.24 +
            Math.sin(x * k * 0.43 + t * speed * 0.55 + 4.1) * 0.32 +
            Math.sin(x * k * 4.7 + t * speed * 2.2) * 0.06)
      )
    }

    const drawCaustics = (path: Path2D, surfaceY: number) => {
      if (!cctx || !causticImage) return
      const cw = caustic.width
      const ch = caustic.height
      const data = causticImage.data
      const sy = surfaceY / CAUSTIC_SCALE
      const time = t * 0.5 + 23
      for (let y = 0; y < ch; y++) {
        const depth = (y - sy) / Math.max(ch - sy, 1)
        const fade = depth < 0 ? 0 : Math.max(0, 1 - depth * 0.75)
        if (fade === 0) {
          for (let x = 0; x < cw; x++) data[(y * cw + x) * 4 + 3] = 0
          continue
        }
        for (let x = 0; x < cw; x++) {
          // The raw pattern sits mostly below 0.3; stretch it so the bright lines read.
          const light = Math.min(1, Math.max(0, (causticAt(x * CAUSTIC_SCALE, y * CAUSTIC_SCALE, time) - 0.05) / 0.4))
          const i = (y * cw + x) * 4
          data[i] = 230
          data[i + 1] = 248
          data[i + 2] = 255
          data[i + 3] = Math.round(light * 185 * fade)
        }
      }
      cctx.putImageData(causticImage, 0, 0)
      ctx.save()
      ctx.clip(path)
      ctx.globalCompositeOperation = 'screen'
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(caustic, 0, 0, cw * CAUSTIC_SCALE, ch * CAUSTIC_SCALE)
      ctx.restore()
    }

    const draw = (now: number) => {
      // Real time for pouring, so slow or throttled frames still fill on schedule;
      // capped time for the motion, so a long pause does not jump the waves.
      const elapsed = Math.min((now - last) / 1000, 1)
      const dt = Math.min(elapsed, 0.05)
      last = now
      if (!still) t += dt

      const goal = target.current
      if (goal.fillSeconds) {
        // Pour at a steady rate, slowing a little near the top.
        const diff = goal.level - level
        const step = (elapsed / goal.fillSeconds) * Math.max(0.35, Math.min(1, Math.abs(diff) * 6))
        level += Math.sign(diff) * Math.min(Math.abs(diff), step)
      } else {
        level += (goal.level - level) * Math.min(1, elapsed * 2.2)
      }
      agitation += (goal.agitation - agitation) * Math.min(1, elapsed * 1.2)
      splash.current *= Math.exp(-elapsed * 1.4)
      if (still) {
        level = goal.level
        agitation = 1
      }

      const rough = agitation + splash.current
      ctx.clearRect(0, 0, width, height)
      const baseAmp = Math.min(height * 0.07, 10) * rough
      const surfaceY = height * (1 - level)

      // Distant layers first, lighter and calmer.
      for (const layer of LAYERS) {
        const base = surfaceY + layer.offset * height
        const amp = baseAmp * layer.amp
        const grad = ctx.createLinearGradient(0, base - amp, 0, height)
        grad.addColorStop(0, layer.top)
        grad.addColorStop(1, layer.bottom)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.moveTo(0, height)
        for (let x = 0; x <= width + STEP; x += STEP) ctx.lineTo(x, surfaceAt(x, base, amp, layer.len, layer.speed))
        ctx.lineTo(width, height)
        ctx.closePath()
        ctx.fill()
      }

      // The body of water: turquoise at the top, deepening to blue.
      const amp = baseAmp * BODY.amp
      const crestLine: number[] = []
      const body = new Path2D()
      body.moveTo(0, height)
      for (let x = 0; x <= width + STEP; x += STEP) {
        const y = surfaceAt(x, surfaceY, amp, BODY.len, BODY.speed)
        crestLine.push(y)
        body.lineTo(x, y)
      }
      body.lineTo(width, height)
      body.closePath()
      const deep = ctx.createLinearGradient(0, surfaceY - amp, 0, Math.max(height, surfaceY + 120))
      deep.addColorStop(0, 'rgba(118,206,238,0.9)')
      deep.addColorStop(0.18, 'rgba(70,170,226,0.93)')
      deep.addColorStop(0.6, 'rgba(36,118,202,0.96)')
      deep.addColorStop(1, 'rgba(18,74,160,0.98)')
      ctx.fillStyle = deep
      ctx.fill(body)

      drawCaustics(body, surfaceY)

      // Surface band: water is brighter just under the surface, where it reflects the sky.
      ctx.save()
      ctx.clip(body)
      const band = ctx.createLinearGradient(0, surfaceY - amp, 0, surfaceY + amp + 16)
      band.addColorStop(0, 'rgba(255,255,255,0.38)')
      band.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = band
      ctx.fillRect(0, surfaceY - amp - 4, width, amp * 2 + 22)
      ctx.restore()

      // Meniscus: a crisp bright line where water meets air, with a soft shade beneath.
      ctx.lineJoin = 'round'
      ctx.beginPath()
      crestLine.forEach((y, n) => (n ? ctx.lineTo(n * STEP, y + 3) : ctx.moveTo(0, y + 3)))
      ctx.strokeStyle = 'rgba(16,80,150,0.18)'
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.beginPath()
      crestLine.forEach((y, n) => (n ? ctx.lineTo(n * STEP, y + 0.5) : ctx.moveTo(0, y + 0.5)))
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'
      ctx.lineWidth = 1.6
      ctx.stroke()

      // Sun glints that ride the crests.
      if (!still) {
        for (let g = 0; g < Math.max(2, Math.round(width / 160)); g++) {
          const gx = (((g * 0.37 * width + t * (14 + g * 3)) % width) + width) % width
          const gy = crestLine[Math.round(gx / STEP)] ?? surfaceY
          const twinkle = 0.5 + 0.5 * Math.sin(t * 3 + g * 1.7)
          ctx.fillStyle = `rgba(255,255,255,${0.55 * twinkle})`
          ctx.beginPath()
          ctx.ellipse(gx, gy + 2, 7 * twinkle + 2, 1.2, 0, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      const surfaceAtX = (x: number) =>
        crestLine[Math.max(0, Math.min(crestLine.length - 1, Math.round(x / STEP)))] ?? surfaceY

      // A stream pouring in from the top.
      if (goal.stream && !still && surfaceY > 4) {
        const sx = width * 0.5 + Math.sin(t * 2.3) * 1.5
        const top = surfaceAtX(sx)
        const sw = Math.max(3, Math.min(width * 0.06, 7))
        const pour = ctx.createLinearGradient(sx - sw, 0, sx + sw, 0)
        pour.addColorStop(0, 'rgba(90,180,235,0.35)')
        pour.addColorStop(0.5, 'rgba(210,240,255,0.95)')
        pour.addColorStop(1, 'rgba(90,180,235,0.35)')
        ctx.fillStyle = pour
        ctx.beginPath()
        ctx.moveTo(sx - sw * 0.5, 0)
        for (let y = 0; y <= top; y += 6) ctx.lineTo(sx - sw * 0.5 + Math.sin(y * 0.15 + t * 14) * 0.8, y)
        ctx.lineTo(sx + sw * 0.5, top)
        for (let y = top; y >= 0; y -= 6) ctx.lineTo(sx + sw * 0.5 + Math.sin(y * 0.15 + t * 14 + 1) * 0.8, y)
        ctx.closePath()
        ctx.fill()
        // Where it lands it throws up droplets and drives bubbles down.
        if (Math.random() < dt * 40) {
          drops.push({ x: sx, y: top, vx: (Math.random() - 0.5) * 120, vy: -60 - Math.random() * 110, r: 0.8 + Math.random() * 1.6 })
        }
        if (Math.random() < dt * 18) {
          bubbleList.push({
            x: sx + (Math.random() - 0.5) * 10,
            y: top + 6 + Math.random() * 20,
            r: 1 + Math.random() * 2,
            vy: 10,
            wobble: 2,
            phase: Math.random() * 6,
          })
        }
      }

      // Rough water throws droplets off the crests.
      if (!still && rough > 1.8 && Math.random() < dt * (rough - 1.6) * (width / 50)) {
        const x = Math.random() * width
        drops.push({ x, y: surfaceAtX(x), vx: (Math.random() - 0.5) * 70, vy: -70 - Math.random() * 90 * (rough - 1), r: 0.8 + Math.random() * 1.8 })
      }
      drops = drops.filter((d) => {
        d.vy += GRAVITY * dt
        d.x += d.vx * dt
        d.y += d.vy * dt
        if (d.vy > 0 && d.y > surfaceAtX(d.x)) return false
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(160,215,245,0.9)'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(d.x - d.r * 0.3, d.y - d.r * 0.3, d.r * 0.35, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.95)'
        ctx.fill()
        return d.x > -10 && d.x < width + 10 && d.y < height + 10
      })

      // Bubbles start slow, speed up as they rise, wobble, and pop at the surface.
      if (goal.bubbles && !still && Math.random() < 5 * rough * (width / 400) * dt) {
        bubbleList.push({
          x: Math.random() * width,
          y: height + 4,
          r: 0.8 + Math.random() * Math.random() * 4.5,
          vy: 8 + Math.random() * 12,
          wobble: 1.5 + Math.random() * 3,
          phase: Math.random() * 6,
        })
      }
      bubbleList = bubbleList.filter((b) => {
        b.vy = Math.min(b.vy + (40 + b.r * 18) * dt, 30 + b.r * 22)
        b.y -= b.vy * dt
        const x = b.x + Math.sin(t * 3.2 + b.phase) * b.wobble
        if (b.y < surfaceAtX(x) + b.r) {
          if (b.r > 2.5 && !still) drops.push({ x, y: surfaceAtX(x), vx: (Math.random() - 0.5) * 20, vy: -40, r: 0.7 })
          return false
        }
        const shine = ctx.createRadialGradient(x - b.r * 0.35, b.y - b.r * 0.35, 0, x, b.y, b.r)
        shine.addColorStop(0, 'rgba(255,255,255,0.5)')
        shine.addColorStop(0.7, 'rgba(255,255,255,0.08)')
        shine.addColorStop(1, 'rgba(255,255,255,0.55)')
        ctx.fillStyle = shine
        ctx.beginPath()
        ctx.arc(x, b.y, b.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x - b.r * 0.38, b.y - b.r * 0.38, Math.max(0.5, b.r * 0.28), 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.95)'
        ctx.fill()
        return true
      })

      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
