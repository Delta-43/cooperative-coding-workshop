import { useState } from 'react'
import type { ClientMessage, GameState, Question } from '../contract'
import { CardStack } from '../game/CardStack'
import { FactCard } from '../game/FactCard'
import { FlipClock } from '../game/FlipClock'
import { useCountdown } from '../game/useCountdown'
import { WaterProgress } from '../game/WaterProgress'
import { PlayerChips } from './PlayerChips'
import { RevealPanel } from './RevealPanel'
import { Standings } from './Standings'
import { usePrimaryKey } from './usePrimaryKey'

/** The big screen during a question and its reveal. */
export function HostGame({
  state,
  receivedAt,
  send,
}: {
  state: GameState
  receivedAt: number
  send: (msg: ClientMessage) => void
}) {
  const question = state.question!
  const asking = state.phase === 'question'
  const shown = state.phase === 'reveal' && state.answerShown
  const last = question.index + 1 >= question.total
  const seconds = useCountdown(asking ? question : null, receivedAt)

  // Remember each question's text, so used cards keep theirs as they slide away.
  const [seen, setSeen] = useState<Record<number, Question>>({})
  if (seen[question.index]?.text !== question.text) {
    setSeen({ ...seen, [question.index]: question })
  }

  // After the answer is shown, the host steps to the leaderboard before moving on.
  // This step lives only on the big screen; the server still waits in `reveal`.
  const [board, setBoard] = useState<number | null>(null)
  const onBoard = shown && board === question.index

  const action = asking
    ? { label: 'Reveal the answer', run: () => send({ type: 'reveal' }) }
    : !shown
      ? { label: 'Show the answer', run: () => send({ type: 'show' }) }
      : !onBoard
        ? { label: 'Leaderboard', run: () => setBoard(question.index) }
        : { label: last ? 'Final board' : 'Next question', run: () => send({ type: 'next' }) }
  usePrimaryKey(action.run)

  const done = question.index + (state.phase === 'reveal' ? 1 : 0)
  const everyone = state.players.length > 0 && state.answeredCount >= state.players.length

  return (
    <main className="screen game host host-game">
      <header className="game-top">
        <span className="q-count">
          Question {question.index + 1} <span>of {question.total}</span>
        </span>
        {seconds !== null && <FlipClock seconds={seconds} />}
      </header>

      <CardStack
        index={question.index}
        total={question.total}
        renderCard={(i, isCurrent) => {
          const q = seen[i]
          if (!q) return <p className="card-back">Question {i + 1}</p>
          const live = isCurrent && i === question.index
          return (
            <>
              <p className="card-number">Question {i + 1}</p>
              <h2 className="card-question">{q.text}</h2>
              {live && !shown && (
                <div className="host-answers">
                  <p className="host-answered">
                    {asking ? (
                      seconds === 0 ? (
                        <>Time's up</>
                      ) : everyone ? (
                        <>Everyone has answered</>
                      ) : (
                        <span>
                          Answer in <strong>{q.unit}</strong>
                        </span>
                      )
                    ) : (
                      <>Answers are closed. Drumroll, please…</>
                    )}
                    <span className="host-tally">
                      <strong>{state.answeredCount}</strong> of {state.players.length} answered
                    </span>
                  </p>
                  <PlayerChips players={state.players} showAnswered />
                </div>
              )}
              {live && shown && !onBoard && state.reveal && (
                <RevealPanel key={i} reveal={state.reveal} unit={q.unit} />
              )}
              {live && onBoard && <Standings key={i} state={state} />}
            </>
          )
        }}
      />

      <footer className="host-footer">
        {asking && <FactCard facts={question.fact ? [question.fact] : []} />}
        <div className="host-actions">
          <button className="button host-primary" type="button" onClick={action.run}>
            {action.label}
          </button>
          <span className="host-key">or press Space</span>
        </div>
      </footer>

      <WaterProgress done={done} total={question.total} label={`${done} of ${question.total} questions done`} />
    </main>
  )
}
