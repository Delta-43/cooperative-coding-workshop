import type { GameState } from '../contract'
import { Duck } from '../ducks'
import { ordinal } from '../format'
import { Pond } from '../Pond'

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`

/** The end of the game. `players` arrives in final order: points, then lower total time. */
export function FinalBoard({ state, onNewRoom }: { state: GameState; onNewRoom: () => void }) {
  const [winner, ...rest] = state.players

  return (
    <main className="screen host final-board">
      <h1 className="brand host-brand">
        Guess <em>Closer!</em>
      </h1>

      {winner ? (
        <section className="card card-in winner">
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
            <li key={p.id} style={{ animationDelay: `${600 + i * 120}ms` }}>
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
