import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createRoom, recall, remember } from '@/lib/api'
import { Host } from '@/views/Host'
import { Player } from '@/views/Player'

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

function Home() {
  const [code, setCode] = useState('')
  return (
    <main className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-4xl font-bold">Closest Number</h1>
      <p className="text-muted-foreground">Guess the number. The closest answer wins the round.</p>
      <Card>
        <CardHeader>
          <CardTitle>Join a game</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (code.length === 4) location.hash = `#/join/${code}`
            }}
          >
            <Input
              value={code}
              maxLength={4}
              placeholder="ROOM CODE"
              className="h-14 text-center font-mono text-2xl uppercase tracking-widest"
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
            />
            <Button type="submit" size="lg" className="w-full" disabled={code.length !== 4}>
              Join
            </Button>
          </form>
        </CardContent>
      </Card>
      <a className="text-sm text-muted-foreground underline" href="#/host">
        Host a game
      </a>
    </main>
  )
}

function HostEntry() {
  const [room, setRoom] = useState<{ code: string; hostToken: string } | null>(() => {
    const saved = recall('cn:host')
    return saved ? JSON.parse(saved) : null
  })
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')

  if (room) return <Host code={room.code} hostToken={room.hostToken} />

  return (
    <main className="mx-auto max-w-md space-y-4 p-6">
      <Button
        size="lg"
        className="w-full"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          try {
            const created = await createRoom()
            remember('cn:host', JSON.stringify(created))
            setRoom(created)
          } catch (e) {
            setProblem((e as Error).message)
            setBusy(false)
          }
        }}
      >
        {busy ? 'Creating...' : 'Create a room'}
      </Button>
      {problem && <p className="text-destructive">{problem}</p>}
    </main>
  )
}

export default function App() {
  const hash = useHash()
  const join = hash.match(/^#\/join\/([A-Za-z]{4})$/)
  if (join) return <Player code={join[1].toUpperCase()} />
  if (hash === '#/host') return <HostEntry />
  return <Home />
}
