import type { CSSProperties } from 'react'
import type { GameState } from '../contract'
import { Duck } from '../ducks'
import { ordinal } from '../format'
import { Pond } from '../Pond'

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`

// The whole build-up stays under about 2.5 seconds, so it never holds up reading the result.
const ROWS_START = 300
const ROWS_SPREAD = 1500

const BUBBLE_COLOURS = ['var(--mint)', 'var(--marigold)', 'var(--periwinkle)', 'var(--sky)']

/** Pastel bubbles that rise from behind the winner's card and pop. */
function Celebration({ delay }: { delay: number }) {
  return (
    <div className="celebration" aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => {
        // Spread evenly but not in a pattern the eye notices.
        const x = (i * 37) % 100
        const size = 10 + ((i * 13) % 22)
        const drift = ((i * 29) % 60) - 30
        return (
          <span
            key={i}
            style={
              {
                left: `${x}%`,
                width: size,
                height: size,
                background: BUBBLE_COLOURS[i % BUBBLE_COLOURS.length],
                '--drift': `${drift}px`,
                animationDelay: `${delay + ((i * 53) % 700)}ms`,
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
}

/**
 * The end of the game. `players` arrives in final order: points, then lower total time.
 * Places appear from last up to second, then the winner lands.
 */
export function FinalBoard({ state, onNewRoom }: { state: GameState; onNewRoom: () => void }) {
  const [winner, ...rest] = state.players
  const step = rest.length ? Math.min(160, ROWS_SPREAD / rest.length) : 0
  const winnerDelay = ROWS_START + rest.length * step + 250

  return (
    <main className="screen host final-board">
      <h1 className="brand host-brand">
        Guess <em>Closer!</em>
      </h1>

      {winner ? (
        <section className="card winner winner-in" style={{ animationDelay: `${winnerDelay}ms` }}>
          <Celebration delay={winnerDelay + 300} />
          <Duck pose="cheering" />
          <p className="winner-label">The winner is</p>
          <h2 className="winner-name">{winner.name}</h2>
          <p className="winner-score">
            {winner.score} {winner.score === 1 ? 'point' : 'points'}
          </p>
        </section>
      ) : (
        <section className="card card-in winner">
          <h2 className="winner-name">Game over</h2>
        </section>
      )}

      {rest.length > 0 && (
        <ol className="board" start={2}>
          {rest.map((p, i) => (
            <li key={p.id} style={{ animationDelay: `${ROWS_START + (rest.length - 1 - i) * step}ms` }}>
              <span className="board-place">{ordinal(i + 2)}</span>
              <span className="board-name">{p.name}</span>
              <span className="board-time">{seconds(p.time)}</span>
              <span className="board-score">{p.score}</span>
            </li>
          ))}
        </ol>
      )}
      {rest.length > 0 && <p className="board-note">Equal points go to the faster total answer time.</p>}

      <div className="host-actions">
        <button className="button host-secondary" type="button" onClick={onNewRoom}>
          Open a new room
        </button>
      </div>
      <Pond />
    </main>
  )
}
