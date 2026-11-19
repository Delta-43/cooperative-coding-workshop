import type { GameState } from '../contract'
import { Beaker } from '../game/Beaker'
import { Digits } from '../Digits'
import { formatNumber, howFar, ordinal } from '../format'

/** After the host sends `show`: the right answer, how close this player was, and their points. */
export function ResultPanel({ state }: { state: GameState }) {
  const reveal = state.reveal!
  const unit = state.question?.unit ?? ''
  const result = reveal.results.find((r) => r.playerId === state.you.playerId)
  const answered = result && result.value !== null && result.error !== null
  const closeness = answered ? Math.max(0, 1 - Math.min(1, result.error!)) : 0

  return (
    <div className="result">
      <Beaker
        level={Math.max(closeness, 0.04)}
        label={answered ? `${Math.round(closeness * 100)}% close` : 'No answer'}
      />
      <div className="result-text">
        <p className="result-label">The answer</p>
        <p className="result-correct">
          <Digits value={reveal.correct} /> <span>{unit}</span>
        </p>
        {answered ? (
          <>
            <p className="result-yours">
              You said {formatNumber(result.value!)}
            </p>
            <p className="result-far">{howFar(result.error!, result.value!, reveal.correct)}</p>
            <p className="result-points">
              {result.rank !== null && <span>{ordinal(result.rank)}</span>}
              <strong>+{result.points}</strong> {result.points === 1 ? 'point' : 'points'}
            </p>
          </>
        ) : (
          <p className="result-yours">No answer this time, so no points.</p>
        )}
      </div>
    </div>
  )
}
