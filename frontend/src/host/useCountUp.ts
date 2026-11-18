import { useEffect, useState } from 'react'

const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Counts from 0 up to `target` over `ms`, easing out, so the answer lands rather than appears. */
export function useCountUp(target: number, ms = 1600): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const instant = reducedMotion()
    const start = performance.now()
    let frame = requestAnimationFrame(function step(now) {
      const t = instant ? 1 : Math.min(1, (now - start) / ms)
      const eased = 1 - Math.pow(1 - t, 4)
      setValue(t >= 1 ? target : target * eased)
      if (t < 1) frame = requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(frame)
  }, [target, ms])

  return value
}
