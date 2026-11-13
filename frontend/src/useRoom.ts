import { useCallback, useEffect, useRef, useState } from 'react'
import { recall, remember, wsUrl } from '@/lib/api'
import type { ClientMessage, GameState, ServerError } from '@/types'

interface Options {
  code: string
  hostToken?: string
  /** Players pass their name to join. Leave it undefined to stay disconnected. */
  name?: string
}

export function useRoom({ code, hostToken, name }: Options) {
  const [state, setState] = useState<GameState | null>(null)
  const [error, setError] = useState<ServerError | null>(null)
  const [connected, setConnected] = useState(false)
  /** True after at least one successful connection. A first connection that fails means the room does not exist. */
  const [everConnected, setEverConnected] = useState(false)
  const socket = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!hostToken && !name) return
    let closed = false
    let retry: ReturnType<typeof setTimeout>
    let opened = false

    const connect = () => {
      const ws = new WebSocket(wsUrl(code, hostToken))
      socket.current = ws
      ws.onopen = () => {
        opened = true
        setConnected(true)
        setEverConnected(true)
        if (!hostToken && name) {
          const playerId = recall(`cn:${code}:id`) ?? undefined
          ws.send(JSON.stringify({ type: 'join', name, playerId }))
        }
      }
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        if (msg.type === 'state') {
          setError(null)
          setState(msg)
          if (msg.you.playerId) remember(`cn:${code}:id`, msg.you.playerId)
        } else if (msg.type === 'error') {
          setError(msg)
        }
      }
      ws.onclose = (event) => {
        setConnected(false)
        if (closed) return
        // The Worker refuses the WebSocket for an unknown room code: stop and report it.
        if (!opened) {
          setError({ type: 'error', code: 'no_room', message: 'No game has that code.' })
          return
        }
        // Removed by the host (close code 4000): do not reconnect.
        if (event.code === 4000) {
          setError({ type: 'error', code: 'removed', message: 'The host removed you from the game.' })
          return
        }
        retry = setTimeout(connect, 3000)
      }
    }
    connect()
    return () => {
      closed = true
      clearTimeout(retry)
      socket.current?.close()
    }
  }, [code, hostToken, name])

  const send = useCallback((message: ClientMessage) => {
    socket.current?.send(JSON.stringify(message))
  }, [])

  return { state, error, connected, everConnected, send }
}
