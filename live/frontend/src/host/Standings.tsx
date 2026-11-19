import { useEffect, useState, type CSSProperties } from 'react'
import type { GameState, Player } from '../contract'
import { useCountUp } from './useCountUp'

const SHOWN = 8
// Hold the old order long enough to read it, then let everyone slide to their new place.
const HOLD = 900

const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

// More points first; equal points go to the lower total time, as on the final board.
const byStanding = (score: (p: Player) => number) => (a: Player, b: Player) =>
  score(b) - score(a) || a.time - b.time

function Score({ from, to }: { from: number; to: number }) {
  const value = useCountUp(to, 900, from, HOLD + 200)
  return <span className="standing-score">{Math.round(value)}</span>
}

/**
 * The leaderboard after a round. Rows start in the old order (scores without this round),
 * then slide to the new order while the scores count up and rank changes are marked.
 */
export function Standings({ state }: { state: GameState }) {
  const points = new Map((state.reveal?.results ?? []).map((r) => [r.playerId, r.points]))
  const before = (p: Player) => p.score - (points.get(p.id) ?? 0)

  const oldOrder = [...state.players].sort(byStanding(before))
  const newOrder = [...state.players].sort(byStanding((p) => p.score))
  const oldPlace = new Map(oldOrder.map((p, i) => [p.id, i]))
  const newPlace = new Map(newOrder.map((p, i) => [p.id, i]))

  // After the first round everyone started on 0, so there is no earlier order to climb from.
  const firstRound = state.players.every((p) => before(p) === 0)

  const [moved, setMoved] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setMoved(true), reducedMotion() ? 0 : HOLD)
    return () => clearTimeout(id)
  }, [])

  // Everyone who is in the top rows before or after, so climbers slide in from below.
  const visible = state.players.filter((p) => oldPlace.get(p.id)! < SHOWN || newPlace.get(p.id)! < SHOWN)
  const rows = Math.min(SHOWN, state.players.length)

  return (
    <div className="standings">
      <p className="reveal-label">Leaderboard</p>
      <ol className="standings-list" style={{ '--rows': rows } as CSSProperties}>
        {visible.map((p) => {
          const from = oldPlace.get(p.id)!
          const to = newPlace.get(p.id)!
          const pos = moved ? to : from
          const change = firstRound ? 0 : from - to
          const gained = points.get(p.id) ?? 0
          return (
            <li
              key={p.id}
              className={`standing${pos === 0 && moved ? ' is-leader' : ''}${pos >= SHOWN ? ' is-off' : ''}`}
              style={{ '--pos': Math.min(pos, SHOWN) } as CSSProperties}
              aria-hidden={pos >= SHOWN}
            >
              <span className="standing-place">{to + 1}</span>
              <span className="standing-name">{p.name}</span>
              <span
                className={`standing-change${change > 0 ? ' is-up' : change < 0 ? ' is-down' : ''}${moved && change !== 0 ? ' is-shown' : ''}`}
              >
                {change > 0 ? `▲${change}` : change < 0 ? `▼${-change}` : ''}
                <span className="visually-hidden">
                  {change > 0 ? ` up ${change}` : change < 0 ? ` down ${-change}` : ''}
                </span>
              </span>
              <span className={`standing-gain${gained > 0 ? ' is-shown' : ''}`}>{gained > 0 ? `+${gained}` : ''}</span>
              <Score from={before(p)} to={p.score} />
            </li>
          )
        })}
      </ol>
      {state.players.length > SHOWN && (
        <p className="results-more">and {state.players.length - SHOWN} more</p>
      )}
    </div>
  )
}
