import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatNumber, recall, remember } from '@/lib/api'
import { useRoom } from '@/useRoom'

export function Player({ code }: { code: string }) {
  const [name, setName] = useState<string | undefined>(recall(`cn:${code}:name`) ?? undefined)
  const [draft, setDraft] = useState('')
  const [guess, setGuess] = useState('')
  const { state, error, connected, send } = useRoom({ code, name })

  const joined = state?.you.playerId != null
  const kicked = name && state && !joined

  if (!name || (error && !joined) || kicked) {
    return (
      <main className="mx-auto max-w-md space-y-4 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Join room {code}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                const trimmed = draft.trim()
                if (!trimmed) return
                remember(`cn:${code}:name`, trimmed)
                setName(trimmed)
              }}
            >
              <Input value={draft} maxLength={16} placeholder="Your nickname" autoFocus onChange={(e) => setDraft(e.target.value)} />
              {error && <p className="text-destructive">{error.message}</p>}
              <Button type="submit" size="lg" className="w-full">
                Join
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (!state) return <p className="p-6 text-lg">{connected ? 'Joining...' : 'Connecting...'}</p>

  const me = state.players.find((p) => p.id === state.you.playerId)
  const myResult = state.reveal?.results.find((r) => r.playerId === state.you.playerId)
  const rankOf = [...state.players].sort((a, b) => b.score - a.score).findIndex((p) => p.id === state.you.playerId) + 1

  return (
    <main className="mx-auto max-w-md space-y-4 p-6">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">{me?.name}</span>
        <Badge>{me?.score ?? 0} points</Badge>
      </div>

      {state.phase === 'lobby' && (
        <Card>
          <CardContent className="py-8 text-center text-lg">You're in. Waiting for the host to start...</CardContent>
        </Card>
      )}

      {state.phase === 'question' && state.question && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">
              Question {state.question.index + 1} of {state.question.total}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl font-semibold leading-snug">{state.question.text}</p>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                const value = Number(guess.replace(/,/g, ''))
                if (guess.trim() !== '' && Number.isFinite(value)) send({ type: 'answer', value })
              }}
            >
              <Input
                type="text"
                inputMode="decimal"
                value={guess}
                placeholder={`Your answer in ${state.question.unit}`}
                className="h-14 text-2xl"
                onChange={(e) => setGuess(e.target.value)}
              />
              <Button type="submit" size="lg" className="w-full">
                {state.you.answer === null ? 'Send answer' : 'Change answer'}
              </Button>
            </form>
            {state.you.answer !== null && <p className="text-muted-foreground">Sent: {formatNumber(state.you.answer)}. You can still change it.</p>}
          </CardContent>
        </Card>
      )}

      {state.phase === 'reveal' && state.reveal && (
        <Card>
          <CardContent className="space-y-3 py-8 text-center">
            <p className="text-muted-foreground">The answer was</p>
            <p className="text-4xl font-bold">{formatNumber(state.reveal.correct)}</p>
            {myResult?.value == null ? (
              <p className="text-lg">You didn't answer this one.</p>
            ) : (
              <p className="text-lg">
                You said {formatNumber(myResult.value)}: place {myResult.rank}, +{myResult.points} points
              </p>
            )}
            <p className="text-muted-foreground">Waiting for the next question...</p>
          </CardContent>
        </Card>
      )}

      {state.phase === 'over' && (
        <Card>
          <CardContent className="space-y-2 py-8 text-center">
            <p className="text-3xl font-bold">Game over</p>
            <p className="text-xl">
              You finished {rankOf} of {state.players.length} with {me?.score ?? 0} points
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
