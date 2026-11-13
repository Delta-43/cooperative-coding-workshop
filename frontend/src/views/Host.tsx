import { QRCodeSVG } from 'qrcode.react'
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Duck } from '@/components/Duck'
import { Icon } from '@/components/Icon'
import { Stage } from '@/components/Stage'
import { formatNumber } from '@/lib/api'
import { beatenOnTime, meterLayout, nameCloud, offBy, sizeClass, standings } from '@/lib/game'
import { useRoom } from '@/useRoom'
import type { GameState, PlayerInfo } from '@/types'

function joinUrl(code: string) {
  return `${location.origin}${location.pathname}#/join/${code}`
}

/** Shown under the room code. Set VITE_SHORT_URL (for example a bit.ly link) to replace the long address. */
function JoinAddress() {
  const short = import.meta.env.VITE_SHORT_URL as string | undefined
  if (short) {
    return (
      <p className="url">
        or open <b>{short.replace(/^https?:\/\//, '')}</b>
      </p>
    )
  }
  return (
    <p className="url">
      or open <b>{location.host}</b>
      <br />
      <b>{location.pathname.replace(/\/$/, '') || '/'}</b>
    </p>
  )
}

type RevealStage = 'ready' | 'filling' | 'done'

// Space (or a clicker's next key) does the main action. Backspace steps back on this screen. Esc opens the players menu.
function useHostKeys(handlers: { next: () => void; back: () => void; menu: () => void }) {
  const ref = useRef(handlers)
  useEffect(() => {
    ref.current = handlers
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.code === 'Space' || e.key === 'PageDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        ref.current.next()
      } else if (e.key === 'Backspace' || e.key === 'PageUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        ref.current.back()
      } else if (e.key === 'Escape') {
        ref.current.menu()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

function PlayersMenu({ players, onKick, onClose }: { players: PlayerInfo[]; onKick: (id: string) => void; onClose: () => void }) {
  const [sure, setSure] = useState<string | null>(null)
  return (
    <div className="menu" role="dialog" aria-label="Players">
      <h2>Players · {players.length}</h2>
      <ul>
        {players.map((p) => (
          <li key={p.id}>
            <span className={p.connected ? '' : 'off'}>{p.name}</span>
            <button
              className={`rm ${sure === p.id ? 'sure' : ''}`}
              onClick={() => {
                if (sure === p.id) {
                  onKick(p.id)
                  setSure(null)
                } else setSure(p.id)
              }}
            >
              {sure === p.id ? 'Click to remove' : 'Remove'}
            </button>
          </li>
        ))}
      </ul>
      <p>
        Remove asks once more before it acts. Esc closes this menu.{' '}
        <button className="link" onClick={onClose}>
          Close
        </button>
      </p>
    </div>
  )
}

function Lobby({ state, onStart }: { state: GameState; onStart: () => void }) {
  const cloud = nameCloud(state.players.map((p) => p.name))
  return (
    <div className="lobby">
      <div className="lobby-left">
        <span className="sticker">10 questions</span>
        <h1 className="title">
          <span>GUESS</span>
          <span className="outline">CLOSER!</span>
        </h1>
        <p className="lede">Closest guess wins. Same distance? Faster wins.</p>
        <div className="roster">
          <p className="roster-head">
            <b>{state.players.length}</b> {state.players.length === 1 ? 'duck' : 'ducks'} in the pond
          </p>
          <p className="cloud">
            {state.players.length === 0 ? 'Scan the code to join.' : cloud.shown}
            {cloud.more > 0 && <em> and {cloud.more} more</em>}
          </p>
        </div>
        <button className="btn primary xl" disabled={state.players.length < 1} onClick={onStart}>
          Start game <Icon name="arrow" size={28} />
        </button>
      </div>
      <div className="lobby-right">
        <div className="perch">
          <Duck pose="flying" />
        </div>
        <div className="qr-card">
          <QRCodeSVG value={joinUrl(state.code)} size={160} bgColor="#ffffff" fgColor="#011627" level="M" />
        </div>
        <div className="code" aria-label={`Room code ${state.code.split('').join(' ')}`}>
          {state.code}
        </div>
        <JoinAddress />
      </div>
    </div>
  )
}

function Question({ state, onReveal }: { state: GameState; onReveal: () => void }) {
  const q = state.question!
  const total = state.players.length
  return (
    <div className="q-wrap">
      <div className="seg" role="img" aria-label={`Question ${q.index + 1} of ${q.total}`}>
        {Array.from({ length: q.total }, (_, i) => (
          <i key={i} className={i < q.index ? 'on' : i === q.index ? 'now' : ''} />
        ))}
      </div>
      <div className="q-layout">
        <div className="q-main">
          <p className={`q-text ${q.text.length > 70 ? 'long' : ''}`}>{q.text}</p>
          <p className="unit">
            Answer in <b>{q.unit}</b>
          </p>
          <div className="act">
            <button className="btn primary xl" onClick={onReveal}>
              Reveal answer <Icon name="arrow" size={28} />
            </button>
          </div>
        </div>
        <aside className="q-side" aria-label="Answers in">
          <p className="side-title">Answers in</p>
          <p className="count-big">
            <b>{state.answeredCount}</b>
            <span>of {total}</span>
          </p>
          <div className="hbar" role="img" aria-label={`${state.answeredCount} of ${total} answered`}>
            <div style={{ width: `${total ? (state.answeredCount / total) * 100 : 0}%` }} />
          </div>
          <p className="count-note">No names here. Players who have not answered see the count on their phone.</p>
        </aside>
      </div>
    </div>
  )
}

interface RevealProps {
  state: GameState
  stage: RevealStage
  onFill: () => void
  onFilled: () => void
  onNext: () => void
}

function Reveal({ state, stage, onFill, onFilled, onNext }: RevealProps) {
  const q = state.question!
  const reveal = state.reveal!
  const layout = meterLayout(reveal.results, reveal.correct)
  const answered = reveal.results.filter((r) => r.value !== null)
  const podium = reveal.results.filter((r) => r.rank !== null && r.rank <= 3)
  const correct = formatNumber(reveal.correct)
  const last = q.index + 1 >= q.total

  return (
    <div className="rv-layout">
      <div className="rv-main">
        {stage !== 'done' ? (
          <>
            <p className="rv-q big">{q.text}</p>
            <p className="big-num unknown">
              ? <span>{q.unit}</span>
            </p>
            <p className="rv-hint">
              {answered.length} {answered.length === 1 ? 'guess is' : 'guesses are'} in. Each square is one guess.
            </p>
            <button className="btn primary xl" disabled={stage === 'filling'} onClick={onFill}>
              Fill the bar <Icon name="arrow" size={28} />
            </button>
          </>
        ) : (
          <>
            <p className="rv-q">{q.text}</p>
            <p className={`big-num ${sizeClass(correct)}`}>
              {correct} <span>{q.unit}</span>
            </p>
            <ol className="podium">
              {podium.length === 0 && <li className="none">Nobody answered this one.</li>}
              {podium.map((r) => {
                const late = beatenOnTime(reveal.results, r)
                return (
                  <li key={r.playerId} className={r.rank === 1 ? 'first' : ''}>
                    {r.rank === 1 ? <Icon name="crown" size={24} /> : <span className="rk">{r.rank}</span>}
                    <span className="nm">{r.name}</span>
                    <span className="gs">
                      {formatNumber(r.value!)} · {offBy(r.value!, reveal.correct)}
                      {late && `, ${late.seconds} s after ${late.name}`}
                    </span>
                    <span className="pts">+{r.points}</span>
                  </li>
                )
              })}
            </ol>
            <button className="btn primary xl" onClick={onNext}>
              {last ? 'Final scores' : 'Next question'} <Icon name="arrow" size={28} />
            </button>
          </>
        )}
      </div>

      <div
        className="meter"
        data-stage={stage}
        role="img"
        aria-label={stage === 'done' ? `The answer is ${correct} ${q.unit}.` : `${answered.length} guesses beside an empty bar.`}
      >
        <span className="tick t-hi">{formatNumber(Math.round(layout.hi))}</span>
        <span className="tick t-lo">{formatNumber(Math.round(layout.lo))}</span>
        {layout.above > 0 && (
          <span className="far hi">
            {layout.above} {layout.above === 1 ? 'guess' : 'guesses'} above
          </span>
        )}
        {layout.below > 0 && (
          <span className="far lo">
            {layout.below} {layout.below === 1 ? 'guess' : 'guesses'} below
          </span>
        )}
        <div className="tube">
          <div
            className="fill"
            style={{ '--to': `${layout.to}%` } as CSSProperties}
            onAnimationEnd={(e) => {
              if (e.animationName === 'fill-up') onFilled()
            }}
          />
        </div>
        <div className="level" style={{ bottom: `${layout.to}%` }}>
          <span>{correct}</span>
        </div>
        <div className="guesses">
          {layout.marks.map((m, i) => (
            <i key={i} className="g" style={{ bottom: `${m.bottom}%`, '--lvl': m.lvl } as CSSProperties} />
          ))}
          {layout.top.map((t) => (
            <i key={t.name} className={`g top ${t.first ? 'first' : ''}`} style={{ bottom: `${t.bottom}%`, '--nudge': `${t.nudge}px` } as CSSProperties}>
              <span>
                {t.name} · {formatNumber(t.value)}
              </span>
            </i>
          ))}
        </div>
      </div>
    </div>
  )
}

function Final({ state, confirm, onNewGame }: { state: GameState; confirm: boolean; onNewGame: () => void }) {
  const order = standings(state.players)
  const winner = order[0]
  const top = order.slice(0, 5)
  return (
    <div className="final-layout">
      <div className="winner">
        <Icon name="crown" size={64} className="gold" />
        {winner && <span className="sticker">Top duck</span>}
        <h2 className={`title ${winner && winner.name.length > 6 ? 'long' : ''}`}>
          <span>{winner ? winner.name.toUpperCase() : 'NOBODY'}</span>
          <span className="outline">WINS</span>
        </h2>
        <p className="lede">{winner ? `${winner.score} points` : 'No players this time'}</p>
        <button className="btn second xl" onClick={onNewGame}>
          {confirm ? 'Sure? New game' : 'New game'}
        </button>
      </div>
      <div className="board-wrap">
        <div className="perch-board">
          <Duck pose="landing" />
        </div>
        <ol className="board">
          {top.map((p, i) => (
            <li key={p.id} className={i === 0 ? 'first' : ''}>
              <span>{i + 1}</span>
              <span className="nm">{p.name}</span>
              <span className="mono">{p.score}</span>
            </li>
          ))}
        </ol>
        {order.length > 5 && <p className="more">+ {order.length - 5} more. Your place is on your phone.</p>}
      </div>
    </div>
  )
}

export function Host({ code, hostToken, onNewGame }: { code: string; hostToken: string; onNewGame: () => void }) {
  const { state, error, connected, send } = useRoom({ code, hostToken })
  // The reveal stage belongs to one question: a new question starts empty without an effect.
  const [revealFor, setRevealFor] = useState<{ key: string; stage: RevealStage }>({ key: '', stage: 'ready' })
  const [menu, setMenu] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const revealKey = `${state?.phase}:${state?.question?.index ?? -1}`
  const stage: RevealStage = revealFor.key === revealKey ? revealFor.stage : 'ready'
  const setStage = useCallback((next: RevealStage) => setRevealFor({ key: revealKey, stage: next }), [revealKey])
  // The final screen has no question, so it shows the length of the question set the game used.
  const total = state?.question?.total ?? 10
  // Server errors show for 3 seconds. The timer is the external system this effect syncs with.
  const [hidden, setHidden] = useState<object | null>(null)
  const notice = error && hidden !== error ? error.message : null
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setHidden(error), 3000)
    return () => clearTimeout(t)
  }, [error])
  useEffect(() => {
    if (!confirm) return
    const t = setTimeout(() => setConfirm(false), 4000)
    return () => clearTimeout(t)
  }, [confirm])

  const fill = useCallback(() => {
    const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    setStage(reduced ? 'done' : 'filling')
  }, [setStage])
  const newGame = () => {
    if (confirm) onNewGame()
    else setConfirm(true)
  }

  useHostKeys({
    next: () => {
      if (!state || menu) return
      if (state.phase === 'lobby' && state.players.length > 0) send({ type: 'start' })
      else if (state.phase === 'question') send({ type: 'reveal' })
      else if (state.phase === 'reveal') {
        if (stage === 'ready') fill()
        else if (stage === 'done') send({ type: 'next' })
      } else if (state.phase === 'over') newGame()
    },
    back: () => {
      if (menu) setMenu(false)
      else if (confirm) setConfirm(false)
      else if (state?.phase === 'reveal' && stage === 'done') setStage('ready')
    },
    menu: () => setMenu((m) => !m),
  })

  if (!state) {
    return (
      <Stage step="CONNECTING" help="GUESS CLOSER!" space="start">
        <p className="lede">{connected ? 'Loading the room...' : 'Connecting to the game server...'}</p>
      </Stage>
    )
  }

  const q = state.question
  let step = 'LOBBY'
  let count = `${state.players.length} JOINED`
  let help = 'SCAN, GUESS, CLOSEST WINS'
  let space = 'start'
  if (state.phase === 'question' && q) {
    step = `QUESTION ${q.index + 1} OF ${q.total}`
    count = `${state.players.length} PLAYERS`
    help = 'CLOSEST GUESS WINS'
    space = 'reveal'
  } else if (state.phase === 'reveal' && q) {
    step = 'ANSWER'
    count = `QUESTION ${q.index + 1} OF ${q.total}`
    help = stage === 'done' ? 'EVERYONE ELSE: CHECK YOUR PHONE' : 'WHERE IS THE ANSWER?'
    space = stage === 'done' ? (q.index + 1 >= q.total ? 'final scores' : 'next') : 'fill'
  } else if (state.phase === 'over') {
    step = 'GAME OVER'
    count = `${total} QUESTIONS`
    help = 'THANKS FOR PLAYING'
    space = 'twice: new game'
  }

  return (
    <Stage room={state.code} step={step} count={count} help={help} space={space}>
      {state.phase === 'lobby' && <Lobby state={state} onStart={() => send({ type: 'start' })} />}
      {state.phase === 'question' && q && <Question state={state} onReveal={() => send({ type: 'reveal' })} />}
      {state.phase === 'reveal' && q && state.reveal && (
        <Reveal state={state} stage={stage} onFill={fill} onFilled={() => setStage('done')} onNext={() => send({ type: 'next' })} />
      )}
      {state.phase === 'over' && <Final state={state} confirm={confirm} onNewGame={newGame} />}
      {menu && <PlayersMenu players={state.players} onKick={(playerId) => send({ type: 'kick', playerId })} onClose={() => setMenu(false)} />}
      {confirm && <div className="notice">Press Space again for a new game. Backspace cancels.</div>}
      {!connected && <div className="notice bad">Connection lost. Reconnecting...</div>}
      {notice && connected && <div className="notice bad">{notice}</div>}
    </Stage>
  )
}
