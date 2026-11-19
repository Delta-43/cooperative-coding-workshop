import type { Player } from '../contract'

/**
 * Everyone in the room as name chips. During a question a chip fills in when that
 * player has answered (never with the value). The host can remove a player.
 */
export function PlayerChips({
  players,
  showAnswered = false,
  onKick,
}: {
  players: Player[]
  showAnswered?: boolean
  onKick?: (playerId: string) => void
}) {
  return (
    <ul className="chips">
      {players.map((p) => (
        <li
          key={p.id}
          className={`chip${showAnswered && p.answered ? ' is-answered' : ''}${p.connected ? '' : ' is-away'}`}
        >
          {showAnswered && p.answered && <span className="tick" aria-hidden="true" />}
          <span className="chip-name">{p.name}</span>
          {showAnswered && <span className="visually-hidden">{p.answered ? ', answered' : ', thinking'}</span>}
          {!p.connected && <span className="visually-hidden">, disconnected</span>}
          {onKick && (
            <button
              type="button"
              className="chip-kick"
              onClick={() => onKick(p.id)}
              aria-label={`Remove ${p.name}`}
              title={`Remove ${p.name}`}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
              </svg>
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
