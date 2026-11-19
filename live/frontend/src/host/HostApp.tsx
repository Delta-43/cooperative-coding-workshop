import { useState } from 'react'
import { Duck } from '../ducks'
import { Pond } from '../Pond'
import { createRoom, saveRoom, savedRoom, type HostRoom } from './api'
import { HostSession } from './HostSession'

/** The big screen: create a room, then run the game. */
export function HostApp() {
  const [room, setRoom] = useState<HostRoom | null>(savedRoom)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)

  const create = async () => {
    setBusy(true)
    setProblem(null)
    try {
      const next = await createRoom()
      saveRoom(next)
      setRoom(next)
    } catch {
      setProblem("We couldn't reach the game server. Check the connection and try again.")
    } finally {
      setBusy(false)
    }
  }

  if (room) {
    return (
      <HostSession
        key={room.code}
        room={room}
        onClosed={(reason) => {
          saveRoom(null)
          setRoom(null)
          setProblem(reason)
        }}
      />
    )
  }

  return (
    <main className="screen host">
      <h1 className="brand host-brand">
        Guess <em>Closer!</em>
      </h1>
      <section className="card card-in host-start">
        <Duck pose="swimming" />
        <p className="host-start-lede">A number quiz for the whole room. Closest guess wins.</p>
        {problem && (
          <p className="alert" role="alert">
            {problem}
          </p>
        )}
        <button className="button" type="button" onClick={create} disabled={busy}>
          {busy ? 'Opening a room…' : 'Open a room'}
        </button>
      </section>
      <Pond />
    </main>
  )
}
