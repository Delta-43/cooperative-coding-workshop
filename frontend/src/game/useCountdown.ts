import { useEffect, useState } from 'react'
import type { Question } from '../contract'

/**
 * Seconds left to answer, or null when there is no open question.
 * The time left is `endsAt - serverTime` when the state arrived, counted down on this
 * device's own monotonic clock. Never compares endsAt with the phone's wall clock.
 */
export function useCountdown(question: Question | null, receivedAt: number): number | null {
  const [now, setNow] = useState(() => performance.now())
  const open = question !== null

  useEffect(() => {
    if (!open) return
    const id = setInterval(() => setNow(performance.now()), 200)
    return () => clearInterval(id)
  }, [open])

  if (!open) return null
  const deadline = receivedAt + (question.endsAt - question.serverTime)
  // `now` stops ticking between questions, so never let it lag behind the latest message.
  const current = Math.max(now, receivedAt)
  return Math.max(0, Math.ceil((deadline - current) / 1000))
}
