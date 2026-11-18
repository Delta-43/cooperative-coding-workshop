import type { GameState } from '../contract'
import { formatNumber, howFar, ordinal } from '../format'
import { useCountUp } from './useCountUp'

const SHOWN = 8

/** After `show`: the correct answer lands, then the closest guesses in rank order. */
export function RevealPanel({ reveal, unit }: { reveal: NonNullable<GameState['reveal']>; unit: string }) {
  const counted = useCountUp(reveal.correct)
  const whole = Number.isInteger(reveal.correct)
  const ranked = reveal.results.filter((r) => r.rank !== null)
  const silent = reveal.results.length - ranked.length

  return (
    <div className="reveal">
      <p className="reveal-label">The answer is</p>
      <p className="reveal-number">
        {formatNumber(whole ? Math.round(counted) : Math.round(counted * 100) / 100)} <span>{unit}</span>
      </p>

      {ranked.length === 0 ? (
        <p className="reveal-empty">Nobody answered this one.</p>
      ) : (
        <ol className="results">
          {ranked.slice(0, SHOWN).map((r, n) => (
            <li
              key={r.playerId}
              className={`result-row${r.points > 0 ? ' is-scoring' : ''}`}
              style={{ animationDelay: `${1700 + n * 140}ms` }}
            >
              <span className="result-rank">{ordinal(r.rank!)}</span>
              <span className="result-name">{r.name}</span>
              <span className="result-guess">{formatNumber(r.value!)}</span>
              <span className="result-off">{howFar(r.error!, r.value!, reveal.correct)}</span>
              <span className="result-pts">{r.points > 0 ? `+${r.points}` : ''}</span>
            </li>
          ))}
        </ol>
      )}
      {(ranked.length > SHOWN || silent > 0) && (
        <p className="results-more">
          {ranked.length > SHOWN && `and ${ranked.length - SHOWN} more`}
          {ranked.length > SHOWN && silent > 0 && ' · '}
          {silent > 0 && `${silent} didn't answer`}
        </p>
      )}
    </div>
  )
}
