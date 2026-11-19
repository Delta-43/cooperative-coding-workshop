import { useEffect, useState } from 'react'
import type { GameState } from '../contract'
import { Digits } from '../Digits'
import { howFar, ordinal } from '../format'
import { ClosenessGlass } from './ClosenessGlass'
import { useCountUp } from './useCountUp'

// Fewer rows on a short screen, so the whole list fits above the button.
const shownRows = () => (typeof innerHeight !== 'undefined' && innerHeight < 800 ? 4 : 6)
// The arrow starts once the answer has landed, and takes about four seconds to climb.
const ARROW_START = 1800
const ARROW_CLIMB = 4000

const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** After `show`: the correct answer lands, then the closest guesses in rank order beside the glass. */
export function RevealPanel({ reveal, unit }: { reveal: NonNullable<GameState['reveal']>; unit: string }) {
  const counted = useCountUp(reveal.correct)
  const whole = Number.isInteger(reveal.correct)
  const SHOWN = shownRows()
  const ranked = reveal.results.filter((r) => r.rank !== null).slice(0, SHOWN)
  const totalRanked = reveal.results.filter((r) => r.rank !== null).length
  const silent = reveal.results.length - totalRanked

  // The arrow visits the furthest guess first and finishes on the winner.
  const climb = [...ranked].reverse()
  const [step, setStep] = useState(-1)
  useEffect(() => {
    if (climb.length === 0) return
    if (reducedMotion()) {
      const id = setTimeout(() => setStep(climb.length - 1), 0)
      return () => clearTimeout(id)
    }
    const every = Math.min(1100, Math.max(450, ARROW_CLIMB / climb.length))
    let n = -1
    let tick: ReturnType<typeof setInterval> | undefined
    const begin = setTimeout(() => {
      tick = setInterval(() => {
        n += 1
        setStep(n)
        if (n >= climb.length - 1) clearInterval(tick)
      }, every)
    }, ARROW_START)
    return () => {
      clearTimeout(begin)
      clearInterval(tick)
    }
  }, [climb.length])
  const pointedId = step >= 0 ? (climb[step]?.playerId ?? null) : null

  return (
    <div className="reveal">
      <div className="reveal-main">
        <p className="reveal-label">The answer is</p>
        <p className="reveal-number">
          <Digits value={whole ? Math.round(counted) : Math.round(counted * 100) / 100} /> <span>{unit}</span>
        </p>

        {ranked.length === 0 ? (
          <p className="reveal-empty">Nobody answered this one.</p>
        ) : (
          <ol className="results">
            {ranked.map((r, n) => (
              <li
                key={r.playerId}
                className={`result-row${r.points > 0 ? ' is-scoring' : ''}${r.playerId === pointedId ? ' is-pointed' : ''}`}
                style={{ animationDelay: `${1700 + n * 140}ms` }}
              >
                <span className="result-rank">{ordinal(r.rank!)}</span>
                <span className="result-name">{r.name}</span>
                <span className="result-guess">
                  <Digits value={r.value!} />
                </span>
                <span className="result-off">{howFar(r.error!, r.value!, reveal.correct)}</span>
                <span className="result-pts">{r.points > 0 ? `+${r.points}` : ''}</span>
              </li>
            ))}
          </ol>
        )}
        {(totalRanked > SHOWN || silent > 0) && (
          <p className="results-more">
            {totalRanked > SHOWN && `and ${totalRanked - SHOWN} more`}
            {totalRanked > SHOWN && silent > 0 && ' · '}
            {silent > 0 && `${silent} didn't answer`}
          </p>
        )}
      </div>

      {ranked.length > 0 && (
        <ClosenessGlass
          entries={ranked.map((r) => ({
            id: r.playerId,
            name: r.name,
            closeness: Math.max(0, 1 - Math.min(1, r.error ?? 1)),
          }))}
          pointedId={pointedId}
          step={Math.max(step, 0)}
        />
      )}
    </div>
  )
}
