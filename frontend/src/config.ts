const DEFAULT_BACKEND = 'http://localhost:8787'

// `VITE_BACKEND_URL=same-origin` is for the container, where one server hands out both the page and the game.
const configured: string | undefined = import.meta.env.VITE_BACKEND_URL
const chosen = configured === 'same-origin' ? location.origin : configured || DEFAULT_BACKEND

export const BACKEND_URL = chosen.replace(/\/+$/, '')

export function socketUrl(code: string, hostToken?: string): string {
  const base = BACKEND_URL.replace(/^http/, 'ws')
  const query = hostToken ? `?host=${encodeURIComponent(hostToken)}` : ''
  return `${base}/api/rooms/${code}/ws${query}`
}
