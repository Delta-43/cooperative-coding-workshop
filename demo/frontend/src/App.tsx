import { useEffect, useState } from 'react'
import { Stage } from '@/components/Stage'
import { Icon } from '@/components/Icon'
import { createRoom, recall, remember } from '@/lib/api'
import { Host } from '@/views/Host'
import { JoinForm, Player } from '@/views/Player'

// Hash routing keeps GitHub Pages simple: #/ (home), #/host, #/join/KQWZ
function useHash() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const onChange = () => setHash(location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

/** Bumps on every join attempt, so the player view starts a fresh connection even with the same code and name. */
function useJoinAttempt() {
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const bump = () => setAttempt((n) => n + 1)
    window.addEventListener('cn:joined', bump)
    return () => window.removeEventListener('cn:joined', bump)
  }, [])
  return attempt
}

function HostEntry() {
  const [room, setRoom] = useState<{ code: string; hostToken: string } | null>(() => {
    const saved = recall('cn:host')
    return saved ? JSON.parse(saved) : null
  })
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')

  const create = async () => {
    setBusy(true)
    setProblem('')
    try {
      const created = await createRoom()
      remember('cn:host', JSON.stringify(created))
      setRoom(created)
    } catch (e) {
      setProblem((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (room) {
    return (
      <Host
        key={room.code}
        code={room.code}
        hostToken={room.hostToken}
        onNewGame={() => {
          remember('cn:host', null)
          setRoom(null)
          void create()
        }}
      />
    )
  }

  return (
    <Stage step="NEW ROOM" help="ONE ROOM PER GAME" space="create">
      <div className="lobby">
        <div className="lobby-left">
          <h1 className="title">
            <span>GUESS</span>
            <span className="outline">CLOSER!</span>
          </h1>
          <p className="lede">Create a room, then put this screen on the projector.</p>
          <div className="roster" />
          <button className="btn primary xl" disabled={busy} onClick={create} autoFocus>
            {busy ? 'Creating...' : 'Create a room'} <Icon name="arrow" size={28} />
          </button>
          {problem && <p className="lede" style={{ color: 'var(--red-text)' }}>{problem} Check the connection and try again.</p>}
        </div>
      </div>
    </Stage>
  )
}

export default function App() {
  const hash = useHash()
  const attempt = useJoinAttempt()
  const join = hash.match(/^#\/join\/([A-Za-z]{4})$/)
  if (join) {
    const code = join[1].toUpperCase()
    return <Player key={`${code}:${attempt}`} code={code} />
  }
  if (hash === '#/host') return <HostEntry />
  return <JoinForm />
}
