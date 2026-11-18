const DEFAULT_BACKEND = 'https://guess-closer-live.delta-43.workers.dev'

export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND).replace(/\/+$/, '')

export function socketUrl(code: string, hostToken?: string): string {
  const base = BACKEND_URL.replace(/^http/, 'ws')
  const query = hostToken ? `?host=${encodeURIComponent(hostToken)}` : ''
  return `${base}/api/rooms/${code}/ws${query}`
}
