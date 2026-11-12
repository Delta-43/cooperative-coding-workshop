// The backend address is a setting, so the same build can point at a mock, a test Worker or the live one.
export const BACKEND_URL: string = (import.meta.env.VITE_BACKEND_URL ?? 'https://closest-number.delta-43.workers.dev').replace(/\/$/, '')

export function wsUrl(code: string, hostToken?: string): string {
  const base = BACKEND_URL.replace(/^http/, 'ws')
  return `${base}/api/rooms/${code}/ws${hostToken ? `?host=${hostToken}` : ''}`
}

export async function createRoom(): Promise<{ code: string; hostToken: string }> {
  const res = await fetch(`${BACKEND_URL}/api/rooms`, { method: 'POST' })
  if (!res.ok) throw new Error('Could not create a room.')
  return res.json()
}

export function remember(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* storage can be blocked: the game still works without it */
  }
}

export function recall(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-GB', { maximumFractionDigits: 3 })
}
