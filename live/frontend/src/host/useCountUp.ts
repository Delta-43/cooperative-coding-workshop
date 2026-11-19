import { useEffect, useState } from 'react'

const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Counts from `from` up to `target` over `ms` (after `delay`), easing out, so a number
 * lands rather than appears.
 */
export function useCountUp(target: number, ms = 1600, from = 0, delay = 0): number {
  const [value, setValue] = useState(from)

  useEffect(() => {
    const instant = reducedMotion()
    let frame = 0
    const begin = setTimeout(
      () => {
        const start = performance.now()
        frame = requestAnimationFrame(function step(now) {
          const t = instant ? 1 : Math.min(1, (now - start) / ms)
          const eased = 1 - Math.pow(1 - t, 4)
          setValue(t >= 1 ? target : from + (target - from) * eased)
          if (t < 1) frame = requestAnimationFrame(step)
        })
      },
      instant ? 0 : delay,
    )
    return () => {
      clearTimeout(begin)
      cancelAnimationFrame(frame)
    }
  }, [target, ms, from, delay])

  return value
}
