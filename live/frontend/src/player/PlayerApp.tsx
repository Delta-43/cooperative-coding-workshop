import { useState } from 'react'
import { JoinScreen, type JoinRequest } from './JoinScreen'
import { PlayerSession } from './PlayerSession'

/** The phone: join, then play. A failed join drops back to the form with the reason. */
export function PlayerApp() {
  const [join, setJoin] = useState<JoinRequest | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [last, setLast] = useState<JoinRequest | null>(null)

  if (!join) {
    return (
      <JoinScreen
        problem={problem}
        initial={last}
        onJoin={(request) => {
          setLast(request)
          setProblem(null)
          setAttempt((n) => n + 1)
          setJoin(request)
        }}
      />
    )
  }

  return (
    <PlayerSession
      key={attempt}
      code={join.code}
      name={join.name}
      onLeave={(reason) => {
        setProblem(reason)
        setJoin(null)
      }}
    />
  )
}
