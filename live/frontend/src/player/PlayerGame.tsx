import { useState } from 'react'
import type { ClientMessage, GameState, Question, ServerError } from '../contract'
import { CardStack } from '../game/CardStack'
import { FactCard } from '../game/FactCard'
import { FlipClock } from '../game/FlipClock'
import { useCountdown } from '../game/useCountdown'
import { WaterProgress } from '../game/WaterProgress'
import { AnswerPanel } from './AnswerPanel'

/** The phone during a question and its reveal. */
export function PlayerGame({
  state,
  receivedAt,
  error,
  send,
}: {
  state: GameState
  receivedAt: number
  error: (ServerError & { at: number }) | null
  send: (msg: ClientMessage) => void
}) {
  const question = state.question!
  const seconds = useCountdown(state.phase === 'question' ? question : null, receivedAt)

  // Remember each question's text, so used cards keep theirs as they slide away.
  const [seen, setSeen] = useState<Record<number, Question>>({})
  if (seen[question.index]?.text !== question.text) {
    setSeen({ ...seen, [question.index]: question })
  }

  const facts = question.fact ? [question.fact] : []
  const answered = state.you.answer !== null
  const done = question.index + (state.phase === 'reveal' ? 1 : 0)

  return (
    <main className="screen game">
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
          return (
            <>
              <p className="card-number">Question {i + 1}</p>
              <h2 className="card-question">{q.text}</h2>
              {isCurrent && i === question.index && (
                <AnswerPanel key={i} state={state} seconds={seconds} error={error} send={send} />
              )}
            </>
          )
        }}
      />

      {state.phase === 'question' && answered && <FactCard facts={facts} />}

      <WaterProgress done={done} total={question.total} label={`${done} of ${question.total} questions done`} />
    </main>
  )
}
