import { BACKEND_URL } from '../config'

export interface HostRoom {
  code: string
  hostToken: string
}

const KEY = 'gc:host'

/** POST /api/rooms. The reply is 201 { code, hostToken }. */
export async function createRoom(): Promise<HostRoom> {
  const res = await fetch(`${BACKEND_URL}/api/rooms`, { method: 'POST' })
  if (res.status !== 201) throw new Error(`Could not create a room (${res.status})`)
  return res.json()
}

// The host's room survives a refresh of the big screen, but not a new tab.
export function savedRoom(): HostRoom | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as HostRoom) : null
  } catch {
    return null
  }
}

export function saveRoom(room: HostRoom | null) {
  try {
    if (room) sessionStorage.setItem(KEY, JSON.stringify(room))
    else sessionStorage.removeItem(KEY)
  } catch {
    // Without storage a refresh starts a new room.
  }
}

/** The address players open: the one the host is using, with the room filled in. */
export function joinUrl(code: string): string {
  return `${location.origin}${location.pathname}?room=${code}`
}
