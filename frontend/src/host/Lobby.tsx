import type { ClientMessage, GameState } from '../contract'
import { Pond } from '../Pond'
import { joinUrl } from './api'
import { PlayerChips } from './PlayerChips'
import { QrCode } from './QrCode'
import { usePrimaryKey } from './usePrimaryKey'

export function Lobby({ state, send }: { state: GameState; send: (msg: ClientMessage) => void }) {
  const url = joinUrl(state.code)
  const count = state.players.length
  const canStart = count > 0
  const start = () => send({ type: 'start' })
  usePrimaryKey(canStart ? start : null)

  return (
    <main className="screen host">
      <h1 className="brand host-brand">
        Guess <em>Closer!</em>
      </h1>

      <section className="card card-in lobby">
        <div className="lobby-join">
          <p className="lobby-step">Scan to join</p>
          <QrCode value={url} label={`QR code to join room ${state.code}`} />
        </div>
        <div className="lobby-code">
          <p className="lobby-step">or go to</p>
          <p className="lobby-url">{url.replace(/^https?:\/\//, '').replace(/\?.*$/, '')}</p>
          <p className="lobby-step">and enter</p>
          <p className="lobby-letters" aria-label={`Room code ${state.code.split('').join(' ')}`}>
            {state.code.split('').map((letter, i) => (
              <span key={i} style={{ animationDelay: `${300 + i * 90}ms` }}>
                {letter}
              </span>
            ))}
          </p>
        </div>
      </section>

      <section className="lobby-players" aria-live="polite">
        <p className="lobby-count">
          {count === 0 ? (
            <>
              Waiting for players<span className="dots" />
            </>
          ) : (
            <>
              <strong>{count}</strong> {count === 1 ? 'player' : 'players'} in{' '}
              <span className="lobby-max">of 30</span>
            </>
          )}
        </p>
        <PlayerChips players={state.players} onKick={(playerId) => send({ type: 'kick', playerId })} />
      </section>

      <div className="host-actions">
        <button className="button host-primary" type="button" onClick={start} disabled={!canStart}>
          Start the game
        </button>
        {canStart && <span className="host-key">or press Space</span>}
      </div>
      <Pond />
    </main>
  )
}
