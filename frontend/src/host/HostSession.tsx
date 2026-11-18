import { useEffect } from 'react'
import { useRoom } from '../useRoom'
import type { HostRoom } from './api'
import { FinalBoard } from './FinalBoard'
import { HostGame } from './HostGame'
import { Lobby } from './Lobby'

/** One room on the big screen. Draws whichever phase the server says we are in. */
export function HostSession({ room, onClosed }: { room: HostRoom; onClosed: (reason: string) => void }) {
  const { state, receivedAt, status, send } = useRoom({ code: room.code, hostToken: room.hostToken })

  useEffect(() => {
    if (status === 'unreachable') onClosed(`Room ${room.code} has closed. Open a new one to play again.`)
  }, [status, room.code, onClosed])

  const reconnecting = status === 'reconnecting' && <div className="status-bar">Reconnecting…</div>

  if (!state) {
    return (
      <main className="screen host">
        {reconnecting}
        <p className="host-loading">
          Opening room {room.code}
          <span className="dots" />
        </p>
      </main>
    )
  }

  return (
    <>
      {reconnecting}
      {state.phase === 'lobby' && <Lobby state={state} send={send} />}
      {(state.phase === 'question' || state.phase === 'reveal') && state.question && (
        <HostGame state={state} receivedAt={receivedAt} send={send} />
      )}
      {state.phase === 'over' && <FinalBoard state={state} onNewRoom={() => onClosed('')} />}
    </>
  )
}
