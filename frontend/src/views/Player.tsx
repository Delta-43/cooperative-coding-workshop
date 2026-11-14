import { useEffect, useState, type ReactNode } from 'react'
import { Duck } from '@/components/Duck'
import { Icon } from '@/components/Icon'
import { formatNumber, recall, remember } from '@/lib/api'
import { beatenOnTime, offBy, ordinal, sizeClass, standings } from '@/lib/game'
import { useRoom } from '@/useRoom'
import type { GameState, ServerError } from '@/types'

const CODE_LETTERS = /[^A-HJ-NP-Z]/g // room codes never use I or O

/** The join screen: room code and nickname. Used on the home page and when a QR link opens a room. */
export function JoinForm({ initialCode = '', initialName = '', error }: { initialCode?: string; initialName?: string; error?: ServerError | null }) {
  const [code, setCode] = useState(initialCode)
  const [name, setName] = useState(initialName)
  const codeError = error?.code === 'no_room' && code === initialCode ? `No game has the code ${code}. Check the code on the big screen.` : null
  const nameError = error && ['name_taken', 'bad_name', 'room_full', 'removed'].includes(error.code) ? error.message : null

  return (
    <main className="phone">
      <form
        className="m-pad"
        onSubmit={(e) => {
          e.preventDefault()
          const trimmed = name.trim()
          if (code.length !== 4 || !trimmed) return
          remember(`cn:${code}:name`, trimmed)
          if (code === initialCode) remember(`cn:${code}:id`, null)
          location.hash = `#/join/${code}`
          window.dispatchEvent(new Event('cn:joined'))
        }}
      >
        <h1 className="m-title">
          <span>GUESS</span>
          <span className="outline">CLOSER!</span>
        </h1>
        <p className="m-lede">Join the game on the big screen.</p>
        <label className={`field ${codeError ? 'bad' : ''}`}>
          <span>Room code</span>
          <input
            className="code-in"
            value={code}
            maxLength={4}
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            aria-invalid={codeError ? true : undefined}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(CODE_LETTERS, ''))}
          />
          {codeError && <small className="err">{codeError}</small>}
        </label>
        <label className={`field ${nameError ? 'bad' : ''}`}>
          <span>Nickname</span>
          <input value={name} maxLength={16} autoComplete="nickname" autoCorrect="off" spellCheck={false} enterKeyHint="go" onChange={(e) => setName(e.target.value)} />
          {nameError ? <small className="err">{nameError}</small> : <small>Up to 16 characters. Keep it friendly.</small>}
        </label>
        <button className="btn primary block under" type="submit" disabled={code.length !== 4 || !name.trim()}>
          Join <Icon name="arrow" size={22} />
        </button>
        <p className="home-host">
          <a className="link" href="#/host">
            Host a game
          </a>
        </p>
      </form>
    </main>
  )
}

function Shell({ name, score, children, center = true }: { name: string; score: number; children: ReactNode; center?: boolean }) {
  return (
    <main className="phone">
      <header className="m-top">
        <span className="who">{name}</span>
        <span className="pts-chip">
          {score} {score === 1 ? 'point' : 'points'}
        </span>
      </header>
      <div className={`m-pad ${center ? 'center' : ''}`}>{children}</div>
    </main>
  )
}

interface Best {
  index: number
  off: string
}

function Answer({ state, onSend }: { state: GameState; onSend: (value: number) => void }) {
  const q = state.question!
  // A guess is a whole number: digits only. This keeps "3,5" or "1.056.006" from being read as another number.
  const [guess, setGuess] = useState(state.you.answer === null ? '' : String(Math.round(state.you.answer)).replace(/\D/g, ''))
  const [editing, setEditing] = useState(state.you.answer === null)
  const value = Number(guess)
  const valid = guess !== ''
  const fit = guess.length >= 9 ? 'small' : guess.length >= 7 ? 'mid' : ''

  if (!editing && state.you.answer !== null) {
    return (
      <>
        <h2 className="m-h done">
          <Icon name="check" size={30} /> Answer sent
        </h2>
        <p className="mono sent">
          {formatNumber(state.you.answer)} {q.unit}
        </p>
        <p className="m-lede">
          {state.answeredCount} of {state.players.length} have answered. You can change yours until the host shows the answer. Changing it restarts your time.
        </p>
        <button className="btn second block" onClick={() => setEditing(true)}>
          Change answer
        </button>
      </>
    )
  }

  return (
    <form
      className="m-pad"
      style={{ padding: 0 }}
      onSubmit={(e) => {
        e.preventDefault()
        if (!valid) return
        onSend(value)
        setEditing(false)
      }}
    >
      <div className="seg" role="img" aria-label={`Question ${q.index + 1} of ${q.total}`}>
        {Array.from({ length: q.total }, (_, i) => (
          <i key={i} className={i < q.index ? 'on' : i === q.index ? 'now' : ''} style={{ height: 10 }} />
        ))}
      </div>
      <p className="m-q">{q.text}</p>
      <label className="field big">
        <span>Your guess</span>
        <div className="num-row">
          <input
            className={fit}
            value={guess}
            inputMode="numeric"
            pattern="[0-9]*"
            enterKeyHint="send"
            autoComplete="off"
            autoFocus
            onChange={(e) => setGuess(e.target.value.replace(/\D/g, '').slice(0, 10))}
            aria-label={`Your guess in ${q.unit}, a whole number`}
          />
          <em>{q.unit}</em>
        </div>
      </label>
      <p className="tiny nudge">
        Whole numbers only. {state.answeredCount} of {state.players.length} have answered.
      </p>
      <button className="btn primary block under" type="submit" disabled={!valid}>
        Send answer <Icon name="arrow" size={22} />
      </button>
    </form>
  )
}

function Result({ state }: { state: GameState }) {
  const q = state.question!
  const reveal = state.reveal!
  const me = reveal.results.find((r) => r.playerId === state.you.playerId)
  const correct = formatNumber(reveal.correct)
  const left = q.total - q.index - 1
  const toGo = left === 0 ? 'That was the last question.' : `${left} ${left === 1 ? 'question' : 'questions'} to go.`

  let card: ReactNode
  let note: string
  if (!me || me.value === null) {
    card = (
      <div className="result-card plain">
        <p>No answer counted</p>
        <p className="place">
          — <span>+0</span>
        </p>
      </div>
    )
    note = 'Answers close when the host shows the answer. Get the next one in before then.'
  } else {
    const late = beatenOnTime(reveal.results, me)
    const kind = me.rank === 1 ? '' : late ? 'tie' : 'plain'
    card = (
      <div className={`result-card ${kind}`}>
        <p>
          You said <b className="mono">{formatNumber(me.value)}</b> · {offBy(me.value, reveal.correct)}
        </p>
        <p className="place">
          {ordinal(me.rank!)} <span>+{me.points}</span>
        </p>
      </div>
    )
    if (me.rank === 1) note = `Closest in the room. ${toGo}`
    else if (late) note = `${late.name} was also ${offBy(me.value, reveal.correct)} and answered ${late.seconds} ${late.seconds === 1 ? 'second' : 'seconds'} sooner.`
    else if (me.points > 0) note = `Nice one. ${toGo}`
    else note = `No points this time. ${toGo}`
  }

  return (
    <>
      <p className="m-q-sm">{q.text}</p>
      <p className={`m-big ${sizeClass(correct)}`}>
        {correct} <span>{q.unit}</span>
      </p>
      {card}
      <p className="m-lede">{note}</p>
    </>
  )
}

function Final({ state, best }: { state: GameState; best: Best | null }) {
  const order = standings(state.players)
  const place = order.findIndex((p) => p.id === state.you.playerId) + 1
  const me = order[place - 1]
  if (place === 1) {
    return (
      <>
        <Icon name="crown" size={48} className="gold" />
        <h2 className="m-title sm">
          <span>1ST</span>
          <span className="outline">OF {order.length}</span>
        </h2>
        <p className="m-lede">You won with {me.score} points. Well played.</p>
        <div className="duck-wrap sm">
          <Duck pose="cheering" />
        </div>
      </>
    )
  }
  return (
    <>
      <h2 className="m-title sm">
        <span>{ordinal(place).toUpperCase()}</span>
        <span className="outline">OF {order.length}</span>
      </h2>
      <p className="m-lede">
        {me?.score ?? 0} {me?.score === 1 ? 'point' : 'points'}.
        {best && ` Your best guess was on question ${best.index + 1}: ${best.off}.`}
      </p>
      <div className="duck-wrap sm">
        <Duck pose="shrug" />
      </div>
    </>
  )
}

export function Player({ code }: { code: string }) {
  const [name] = useState<string | undefined>(() => recall(`cn:${code}:name`) ?? undefined)
  const { state, error, connected, everConnected, send } = useRoom({ code, name })

  // Remember this player's closest guess for the final screen.
  const reveal = state?.reveal
  const qIndex = state?.question?.index
  useEffect(() => {
    if (!reveal || qIndex === undefined) return
    const me = reveal.results.find((r) => r.playerId === state?.you.playerId)
    if (!me || me.value === null || me.error === null) return
    const stored = recall(`cn:${code}:best`)
    const prev = stored ? (JSON.parse(stored) as Best & { error: number }) : null
    if (!prev || me.error < prev.error || prev.index === qIndex) {
      remember(`cn:${code}:best`, JSON.stringify({ index: qIndex, off: offBy(me.value, reveal.correct), error: me.error }))
    }
  }, [reveal, qIndex, code, state?.you.playerId])
  const storedBest = recall(`cn:${code}:best`)
  const best: Best | null = storedBest ? JSON.parse(storedBest) : null

  const joined = state?.you.playerId != null
  const blocking = error && ['no_room', 'name_taken', 'bad_name', 'room_full', 'removed'].includes(error.code)
  if (!name || (blocking && !joined) || error?.code === 'removed') {
    return <JoinForm key={error?.code ?? 'new'} initialCode={code} initialName={name ?? ''} error={error} />
  }

  if (everConnected && !connected) {
    return (
      <main className="phone">
        <div className="m-pad center">
          <div className="duck-wrap sm">
            <Duck pose="puzzled" />
          </div>
          <h2 className="m-h warn">
            <Icon name="wifi" size={30} /> Lost the connection
          </h2>
          <p className="m-lede">Trying again every few seconds. Your answer and points are safe.</p>
          <button className="btn second block under" onClick={() => location.reload()}>
            Try now
          </button>
          <p className="tiny">If the room has closed, ask the host for a new code.</p>
        </div>
      </main>
    )
  }

  if (!state || !joined) {
    return (
      <main className="phone">
        <div className="m-pad center">
          <p className="m-lede">{connected ? 'Joining...' : 'Connecting...'}</p>
        </div>
      </main>
    )
  }

  const me = state.players.find((p) => p.id === state.you.playerId)
  const shell = (children: ReactNode, center = true) => (
    <Shell name={me?.name ?? name} score={me?.score ?? 0} center={center}>
      {children}
    </Shell>
  )

  if (state.phase === 'lobby') {
    return shell(
      <>
        <h2 className="bubble">You're in, {me?.name ?? name}!</h2>
        <div className="duck-wrap">
          <Duck pose="swimming" />
        </div>
        <p className="m-lede">
          Waiting for the host to start. {state.players.length} {state.players.length === 1 ? 'player' : 'players'} so far. Best guess wins! First come, first serve.
        </p>
      </>,
    )
  }
  if (state.phase === 'question' && state.question) {
    return shell(<Answer key={state.question.index} state={state} onSend={(value) => send({ type: 'answer', value })} />, state.you.answer !== null)
  }
  if (state.phase === 'reveal' && state.reveal && state.question) return shell(<Result state={state} />)
  // Answers are closed, but the big screen has not shown the answer yet. The server holds the result back until then.
  if (state.phase === 'reveal' && state.question) {
    return shell(
      <>
        <h2 className="m-h">Answers are closed</h2>
        {state.you.answer !== null && (
          <p className="mono sent">
            {formatNumber(state.you.answer)} {state.question.unit}
          </p>
        )}
        <p className="m-lede">{state.you.answer !== null ? 'Your guess is in. Watch the big screen for the answer.' : 'You did not answer this one. Watch the big screen for the answer.'}</p>
      </>,
    )
  }
  return shell(<Final state={state} best={best} />)
}
