import { useState } from 'react'

/** One split-flap digit. The old top half folds down over the new one, like an airport board. */
function FlipDigit({ value }: { value: string }) {
  const [shown, setShown] = useState({ current: value, previous: value, flips: 0 })
  if (shown.current !== value) {
    setShown({ current: value, previous: shown.current, flips: shown.flips + 1 })
  }
  const { current, previous, flips } = shown

  return (
    <span className="flip-digit" aria-hidden="true">
      <span className="flip-half flip-top">
        <span>{current}</span>
      </span>
      <span className="flip-half flip-bottom">
        <span>{flips ? previous : current}</span>
      </span>
      {flips > 0 && (
        <span key={flips} className="flip-anim">
          <span className="flip-half flip-top flip-fold-out">
            <span>{previous}</span>
          </span>
          <span className="flip-half flip-bottom flip-fold-in">
            <span>{current}</span>
          </span>
        </span>
      )}
    </span>
  )
}

/** The countdown in the top right. Turns red for the last ten seconds. */
export function FlipClock({ seconds }: { seconds: number }) {
  const digits = String(seconds).padStart(2, '0').split('')
  const urgent = seconds <= 10
  return (
    <div
      className={`flip-clock${urgent ? ' is-urgent' : ''}${seconds === 0 ? ' is-done' : ''}`}
      role="timer"
      aria-label={seconds === 0 ? "Time's up" : `${seconds} seconds left`}
    >
      {digits.map((d, i) => (
        <FlipDigit key={digits.length - i} value={d} />
      ))}
    </div>
  )
}
