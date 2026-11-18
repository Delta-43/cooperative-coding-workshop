import { useState, type FormEvent } from 'react'
import type { ClientMessage, GameState, ServerError } from '../contract'
import { formatNumber } from '../format'
import { ResultPanel } from './ResultPanel'

const MAX_DIGITS = 12

/** The bottom of the current card on a phone: enter a whole number, see it sent, see the result. */
export function AnswerPanel({
  state,
  seconds,
  error,
  send,
}: {
  state: GameState
  seconds: number | null
  error: (ServerError & { at: number }) | null
  send: (msg: ClientMessage) => void
}) {
  const question = state.question!
  const mine = state.you.answer
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState(mine === null)
  const [sent, setSent] = useState<{ value: number; at: number } | null>(null)

  const lateError = error && sent && error.at > sent.at ? error : null
  const shownAnswer = mine ?? sent?.value ?? null
  const unit = question.unit

  if (state.phase === 'reveal' && state.answerShown && state.reveal) {
    return <ResultPanel state={state} />
  }

  if (state.phase === 'reveal') {
    return (
      <div className="answer-status">
        <p className="status-title">Answers are closed</p>
        <p className="status-line">
          {shownAnswer !== null ? (
            <>
              You said <strong>{formatNumber(shownAnswer)}</strong> {unit}.
            </>
          ) : (
            "You didn't answer this one."
          )}
        </p>
        <p className="status-wait">
          Eyes on the big screen<span className="dots" />
        </p>
      </div>
    )
  }

  if (seconds === 0 || lateError?.code === 'time_up') {
    return (
      <div className="answer-status is-closed">
        <p className="status-title">Time's up</p>
        {lateError?.code === 'time_up' && (
          <p className="status-line">That answer arrived too late{mine !== null ? ', so your earlier one stands' : ''}.</p>
        )}
        <p className="status-line">
          {mine !== null ? (
            <>
              Your answer: <strong>{formatNumber(mine)}</strong> {unit}
            </>
          ) : (
            'No answer this time.'
          )}
        </p>
      </div>
    )
  }

  if (lateError?.code === 'wrong_phase') {
    return (
      <div className="answer-status is-closed">
        <p className="status-title">Answers are closed</p>
      </div>
    )
  }

  if (!editing && shownAnswer !== null) {
    return (
      <div className="answer-status is-sent">
        <p className="status-title">
          <span className="tick" aria-hidden="true" /> Answer sent
        </p>
        <p className="sent-value">
          {formatNumber(shownAnswer)} <span>{unit}</span>
        </p>
        <button
          type="button"
          className="button-quiet"
          onClick={() => {
            setDraft(String(shownAnswer))
            setEditing(true)
          }}
        >
          Change my answer
        </button>
      </div>
    )
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!draft) return
    const value = Number(draft)
    send({ type: 'answer', value })
    setSent({ value, at: performance.now() })
    setEditing(false)
  }

  return (
    <form className="answer-form" onSubmit={submit}>
      <label className="answer-field">
        <span className="visually-hidden">Your answer in {unit}</span>
        <input
          className="answer-input"
          value={draft ? formatNumber(Number(draft)) : ''}
          onChange={(e) => setDraft(e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, MAX_DIGITS))}
          inputMode="numeric"
          autoFocus={sent !== null}
          onFocus={(e) => e.currentTarget.select()}
          autoComplete="off"
          enterKeyHint="send"
          placeholder="0"
          aria-describedby="answer-unit"
        />
        <span id="answer-unit" className="answer-unit">
          {unit}
        </span>
      </label>
      <button className="button" type="submit" disabled={!draft}>
        Lock it in
      </button>
    </form>
  )
}
