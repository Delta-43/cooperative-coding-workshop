import { QRCodeSVG } from 'qrcode.react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/api'
import { useRoom } from '@/useRoom'
import type { GameState } from '@/types'

function joinUrl(code: string) {
  return `${location.origin}${location.pathname}#/join/${code}`
}

function Leaderboard({ state, onKick }: { state: GameState; onKick?: (id: string) => void }) {
  const sorted = [...state.players].sort((a, b) => b.score - a.score)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sorted.length === 0 && <p className="text-muted-foreground">Waiting for players...</p>}
        {sorted.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-2 text-lg">
            <span className={p.connected ? '' : 'text-muted-foreground'}>
              {p.name}
              {state.phase === 'question' && p.answered && <Badge className="ml-2">answered</Badge>}
            </span>
            <span className="flex items-center gap-2 font-semibold tabular-nums">
              {p.score}
              {onKick && (
                <Button size="sm" variant="ghost" aria-label={`Remove ${p.name}`} onClick={() => onKick(p.id)}>
                  ×
                </Button>
              )}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function Host({ code, hostToken }: { code: string; hostToken: string }) {
  const { state, connected, error, send } = useRoom({ code, hostToken })

  if (!state) return <p className="p-8 text-xl">{connected ? 'Loading...' : 'Connecting...'}</p>

  const unit = state.question?.unit ?? ''
  return (
    <main className="mx-auto grid max-w-6xl gap-6 p-6 lg:grid-cols-[1fr_22rem]">
      <section className="space-y-6">
        {error && <p className="text-destructive">{error.message}</p>}

        {state.phase === 'lobby' && (
          <Card>
            <CardContent className="flex flex-col items-center gap-6 py-10 md:flex-row md:justify-around">
              <div className="rounded-xl bg-white p-4">
                <QRCodeSVG value={joinUrl(code)} size={240} />
              </div>
              <div className="space-y-3 text-center">
                <p className="text-muted-foreground">Scan, or open the page and type the code</p>
                <p className="font-mono text-7xl font-bold tracking-widest">{code}</p>
                <Button size="lg" disabled={state.players.length < 1} onClick={() => send({ type: 'start' })}>
                  Start game ({state.players.length} joined)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {state.phase === 'question' && state.question && (
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground">
                Question {state.question.index + 1} of {state.question.total}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-4xl font-semibold leading-tight">{state.question.text}</p>
              <p className="text-xl text-muted-foreground">Answer in {unit}</p>
              <p className="text-2xl">
                {state.answeredCount} of {state.players.length} answered
              </p>
              <Button size="lg" onClick={() => send({ type: 'reveal' })}>
                Reveal answer
              </Button>
            </CardContent>
          </Card>
        )}

        {state.phase === 'reveal' && state.reveal && state.question && (
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground">{state.question.text}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-6xl font-bold">
                {formatNumber(state.reveal.correct)} <span className="text-3xl font-normal text-muted-foreground">{unit}</span>
              </p>
              <ol className="space-y-2 text-xl">
                {state.reveal.results.map((r) => (
                  <li key={r.playerId} className="flex items-center justify-between gap-4">
                    <span>
                      {r.rank ? `${r.rank}. ` : ''}
                      {r.name}
                    </span>
                    <span className="text-muted-foreground">
                      {r.value === null ? 'no answer' : `${formatNumber(r.value)} (off by ${((r.error ?? 0) * 100).toFixed(1)}%)`}
                    </span>
                    <Badge variant={r.points > 0 ? 'default' : 'secondary'}>+{r.points}</Badge>
                  </li>
                ))}
              </ol>
              <Button size="lg" onClick={() => send({ type: 'next' })}>
                {state.question.index + 1 >= state.question.total ? 'Final scores' : 'Next question'}
              </Button>
            </CardContent>
          </Card>
        )}

        {state.phase === 'over' && (
          <Card>
            <CardContent className="space-y-2 py-10 text-center">
              <p className="text-5xl font-bold">Game over</p>
              <p className="text-2xl text-muted-foreground">
                Winner: {[...state.players].sort((a, b) => b.score - a.score)[0]?.name ?? 'nobody'}
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      <Leaderboard state={state} onKick={(playerId) => send({ type: 'kick', playerId })} />
    </main>
  )
}
