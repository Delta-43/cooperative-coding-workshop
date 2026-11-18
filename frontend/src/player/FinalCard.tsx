import type { GameState } from '../contract'
import { Duck } from '../ducks'
import { ordinal } from '../format'

/** The phone after the last question. `players` arrives in final order. */
export function FinalCard({ state }: { state: GameState }) {
  const place = state.players.findIndex((p) => p.id === state.you.playerId) + 1
  const me = state.players[place - 1]
  const podium = state.players.slice(0, 3)

  return (
    <section className="card card-in welcome final">
      <Duck pose={place === 1 ? 'cheering' : place <= 3 ? 'landing' : 'shrug'} />
      {me ? (
        <>
          <p>{place === 1 ? 'You won!' : 'You finished'}</p>
          <h2>
            {ordinal(place)} <span className="final-of">of {state.players.length}</span>
          </h2>
          <p>
            {me.score} {me.score === 1 ? 'point' : 'points'}
          </p>
        </>
      ) : (
        <h2>Game over</h2>
      )}
      <ol className="podium">
        {podium.map((p, i) => (
          <li key={p.id} className={p.id === state.you.playerId ? 'is-me' : undefined}>
            <span className="podium-place">{ordinal(i + 1)}</span>
            <span className="podium-name">{p.name}</span>
            <span className="podium-score">{p.score}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
