import { useCallback, useEffect, useRef, useState } from 'react'
import type { ClientMessage, GameState, ServerError } from './contract'
import { socketUrl } from './config'

export type Status = 'connecting' | 'open' | 'reconnecting' | 'removed' | 'unreachable'

export interface RoomOptions {
  code: string
  hostToken?: string
  /** Players only: the name to join with. */
  name?: string
}

const playerKey = (code: string) => `gc:player:${code}`

function savedPlayerId(code: string): string | undefined {
  try {
    return localStorage.getItem(playerKey(code)) ?? undefined
  } catch {
    return undefined
  }
}

function savePlayerId(code: string, id: string) {
  try {
    localStorage.setItem(playerKey(code), id)
  } catch {
    // Private mode: coming back after a drop will join as a new player.
  }
}

/**
 * One WebSocket to a room. Draws nothing: it hands back the latest `state`,
 * the last `error`, and a way to send. Reconnects after a drop and, for a
 * player, joins again with the saved playerId so the score is kept.
 */
export function useRoom({ code, hostToken, name }: RoomOptions) {
  const [state, setState] = useState<GameState | null>(null)
  // When the latest state arrived, on this device's monotonic clock. The timer counts from here.
  const [receivedAt, setReceivedAt] = useState(0)
  const [error, setError] = useState<(ServerError & { at: number }) | null>(null)
  const [status, setStatus] = useState<Status>('connecting')
  const socket = useRef<WebSocket | null>(null)

  useEffect(() => {
    let stopped = false
    let everOpened = false
    let attempt = 0
    let retry: ReturnType<typeof setTimeout> | undefined

    const connect = () => {
      const ws = new WebSocket(socketUrl(code, hostToken))
      socket.current = ws

      ws.onopen = () => {
        everOpened = true
        attempt = 0
        setStatus('open')
        if (name !== undefined) {
          const playerId = savedPlayerId(code)
          ws.send(JSON.stringify({ type: 'join', name, ...(playerId ? { playerId } : {}) }))
        }
      }

      ws.onmessage = (event) => {
        let msg: GameState | ServerError
        try {
          msg = JSON.parse(String(event.data))
        } catch {
          return
        }
        if (msg.type === 'state') {
          setState(msg)
          setReceivedAt(performance.now())
          if (msg.you.playerId) savePlayerId(code, msg.you.playerId)
        } else if (msg.type === 'error') {
          setError({ ...msg, at: performance.now() })
        }
      }

      ws.onclose = (event) => {
        if (stopped) return
        if (event.code === 4000) {
          setStatus('removed')
          return
        }
        // A room that does not exist refuses the upgrade, so the socket never opens.
        if (!everOpened && attempt >= 1) {
          setStatus('unreachable')
          return
        }
        attempt += 1
        setStatus(everOpened ? 'reconnecting' : 'connecting')
        retry = setTimeout(connect, Math.min(800 * 2 ** (attempt - 1), 8000))
      }
    }

    connect()
    return () => {
      stopped = true
      clearTimeout(retry)
      socket.current?.close()
      socket.current = null
    }
  }, [code, hostToken, name])

  const send = useCallback((msg: ClientMessage) => {
    const ws = socket.current
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg))
  }, [])

  return { state, receivedAt, error, status, send }
}
