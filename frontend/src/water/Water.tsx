import { useEffect, useRef } from 'react'

export interface WaterProps {
  /** Height of the water surface, 0 (empty) to 1 (full). */
  level?: number
  /** How rough the surface is. 1 is calm, 3 is a splash. Changes ease in and out. */
  agitation?: number
  /** Air bubbles rising from the bottom. */
  bubbles?: boolean
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
  speed: number
  wobble: number
  phase: number
}

// Three layers, back to front. Light sky at the back, deeper water in front.
const LAYERS = [
  { top: 'rgba(209,238,249,0.95)', bottom: 'rgba(184,202,245,0.9)', amp: 0.8, len: 1.4, speed: 0.5, offset: -0.13 },
  { top: 'rgba(158,212,239,0.9)', bottom: 'rgba(110,176,232,0.92)', amp: 1.0, len: 1.0, speed: -0.75, offset: -0.065 },
  { top: 'rgba(110,190,240,0.82)', bottom: 'rgba(28,110,205,0.95)', amp: 1.2, len: 0.75, speed: 1.0, offset: 0 },
]

const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Animated water on a canvas. Waves are sums of sines so they never visibly repeat.
 * Used by the pond, the progress bar and the results beaker.
 */
export function Water({
  level = 0.6,
  agitation = 1,
  bubbles = false,
  fillSeconds,
  splashKey,
  className,
}: WaterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const target = useRef({ level, agitation, bubbles, fillSeconds })
  const splash = useRef(0)
  useEffect(() => {
    target.current = { level, agitation, bubbles, fillSeconds }
  }, [level, agitation, bubbles, fillSeconds])
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

    let width = 0
    let height = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const still = reducedMotion()
    // A level poured over fillSeconds starts empty; otherwise start where we are.
    let level = target.current.fillSeconds ? 0 : target.current.level
    let agitation = target.current.agitation
    let bubbleList: Bubble[] = []
    let last = performance.now()
    let t = Math.random() * 100
    let frame = 0

    // Surface height at x for one layer.
    const surface = (x: number, layer: (typeof LAYERS)[number], base: number, amp: number) => {
      const k = (Math.PI * 2) / (Math.max(width, 240) * 0.55 * layer.len)
      return (
        base +
        amp *
          (Math.sin(x * k + t * layer.speed) * 0.6 +
            Math.sin(x * k * 2.3 - t * layer.speed * 1.4 + 1.7) * 0.28 +
            Math.sin(x * k * 0.47 + t * layer.speed * 0.6 + 4.1) * 0.35)
      )
    }

    const draw = (now: number) => {
      // Real time for pouring, so slow or throttled frames still fill on schedule;
      // capped time for the wave motion, so a long pause does not jump the waves.
      const elapsed = Math.min((now - last) / 1000, 1)
      const dt = Math.min(elapsed, 0.05)
      last = now
      if (!still) t += dt

      // Ease towards the target level and roughness.
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

      ctx.clearRect(0, 0, width, height)
      const baseAmp = Math.min(height * 0.075, 11) * (agitation + splash.current)
      const surfaceY = height * (1 - level)
      let frontCrest: number[] = []

      LAYERS.forEach((layer, i) => {
        const base = surfaceY + layer.offset * height
        const amp = baseAmp * layer.amp
        const grad = ctx.createLinearGradient(0, base - amp, 0, height)
        grad.addColorStop(0, layer.top)
        grad.addColorStop(1, layer.bottom)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.moveTo(0, height)
        const step = 6
        const crest: number[] = []
        for (let x = 0; x <= width + step; x += step) {
          const y = surface(x, layer, base, amp)
          crest.push(y)
          ctx.lineTo(x, y)
        }
        ctx.lineTo(width, height)
        ctx.closePath()
        ctx.fill()
        if (i === LAYERS.length - 1) frontCrest = crest
      })

      // Foam line along the front crest.
      if (frontCrest.length) {
        ctx.strokeStyle = 'rgba(255,255,255,0.75)'
        ctx.lineWidth = 2
        ctx.lineJoin = 'round'
        ctx.beginPath()
        frontCrest.forEach((y, n) => (n ? ctx.lineTo(n * 6, y + 1) : ctx.moveTo(0, y + 1)))
        ctx.stroke()

        // Light lines: sunlight bending through the surface, drifting slowly below it.
        ctx.lineWidth = 1.5
        ctx.lineCap = 'round'
        for (let c = 0; c < 3; c++) {
          const depth = 14 + c * 16
          ctx.strokeStyle = `rgba(255,255,255,${0.22 - c * 0.05})`
          ctx.beginPath()
          for (let x = 0; x <= width; x += 8) {
            const crest = frontCrest[Math.round(x / 6)] ?? surfaceY
            const y = crest + depth + Math.sin(x * 0.035 + t * (1.1 + c * 0.3) + c * 2) * 4
            // Break the line into segments so it shimmers rather than stripes.
            const on = Math.sin(x * 0.021 - t * 0.9 + c * 1.3) > 0.15
            if (on) ctx.lineTo(x, y)
            else ctx.moveTo(x, y)
          }
          ctx.stroke()
        }
      }

      // Bubbles rise, wobble, and pop at the surface.
      if (goal.bubbles && !still) {
        const rate = 6 * (agitation + splash.current) * (width / 400)
        if (Math.random() < rate * dt) {
          bubbleList.push({
            x: Math.random() * width,
            y: height + 6,
            r: 2 + Math.random() * 4,
            speed: 28 + Math.random() * 40,
            wobble: 2 + Math.random() * 4,
            phase: Math.random() * 6,
          })
        }
      }
      bubbleList = bubbleList.filter((b) => {
        b.y -= b.speed * dt
        const x = b.x + Math.sin(t * 3 + b.phase) * b.wobble
        const top = frontCrest[Math.round(x / 6)] ?? surfaceY
        if (b.y < top + b.r) return false
        ctx.beginPath()
        ctx.arc(x, b.y, b.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.18)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.85)'
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
