import { useEffect } from 'react'
import type { ErrorCode } from '../contract'
import { Duck } from '../ducks'
import { Pond } from '../Pond'
import { savedPlayerId, useRoom } from '../useRoom'
import { FinalCard } from './FinalCard'
import { PlayerGame } from './PlayerGame'

// Errors that mean the join failed, in plain words.
const JOIN_PROBLEMS: Partial<Record<ErrorCode, string>> = {
  name_taken: 'Someone already has that name. Try another one.',
  bad_name: 'Pick a name of 1 to 16 characters.',
  room_full: 'This room is full: 30 players already.',
}

export function PlayerSession({
  code,
  name,
  onLeave,
}: {
  code: string
  name: string
  onLeave: (reason: string) => void
}) {
  const { state, receivedAt, error, status, send } = useRoom({ code, name })

  const joinProblem = !state?.you.playerId && error ? JOIN_PROBLEMS[error.code] : undefined

  // A finished game keeps its final card after the room clears; anything else goes back to the form.
  const finished = state?.phase === 'over'
  useEffect(() => {
    if (status === 'unreachable') {
      onLeave(
        savedPlayerId(code)
          ? `The game in room ${code} has finished. Ask the host for the new room code.`
          : `We couldn't find room ${code}. Check the code on the big screen.`,
      )
    } else if (status === 'removed') onLeave('The host removed you from the game.')
    else if (status === 'closed' && !finished) onLeave(`Room ${code} has closed. Ask the host for the new room code.`)
    else if (joinProblem) onLeave(joinProblem)
  }, [status, finished, joinProblem, code, onLeave])

  const me = state?.players.find((p) => p.id === state.you.playerId)
  const reconnecting = status === 'reconnecting' && <div className="status-bar">Reconnecting…</div>

  if (state && me && (state.phase === 'question' || state.phase === 'reveal') && state.question) {
    return (
      <>
        {reconnecting}
        <PlayerGame state={state} receivedAt={receivedAt} error={error} send={send} />
      </>
    )
  }

  return (
    <main className="screen">
      {reconnecting}
      <h1 className="brand">
        Guess <em>Closer!</em>
      </h1>
      {!state || !me ? (
        <section className="card card-in welcome" aria-live="polite">
          <Duck pose="flying" />
          <h2>
            Joining<span className="dots" />
          </h2>
        </section>
      ) : state.phase === 'over' ? (
        <FinalCard state={state} />
      ) : (
        <section className="card card-in welcome" aria-live="polite">
          <Duck pose="cheering" />
          <p>You're in,</p>
          <h2>{me.name}</h2>
          <p>
            Watch the big screen. The game starts soon<span className="dots" />
          </p>
          <span className="room-pill">{state.code}</span>
        </section>
      )}
      <Pond />
    </main>
  )
}
