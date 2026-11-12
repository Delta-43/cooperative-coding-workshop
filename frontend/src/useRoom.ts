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
  const socket = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!hostToken && !name) return
    let closed = false
    let retry: ReturnType<typeof setTimeout>

    const connect = () => {
      const ws = new WebSocket(wsUrl(code, hostToken))
      socket.current = ws
      ws.onopen = () => {
        setConnected(true)
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
      ws.onclose = () => {
        setConnected(false)
        if (!closed) retry = setTimeout(connect, 1500)
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

  return { state, error, connected, send }
}
