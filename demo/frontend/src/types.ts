// These types mirror contract/messages.md. Change the contract first, then this file.
export type Phase = 'lobby' | 'question' | 'reveal' | 'over'

export interface PlayerInfo {
  id: string
  name: string
  score: number
  /** Total answer time in ms. Breaks equal final scores: lower is better. */
  time: number
  connected: boolean
  answered: boolean
}

export interface RevealResult {
  playerId: string
  name: string
  value: number | null
  error: number | null
  /** ms from the question opening to this player's last answer, or null with no answer. Breaks equal errors. */
  time: number | null
  rank: number | null
  points: number
}

export interface GameState {
  type: 'state'
  code: string
  phase: Phase
  players: PlayerInfo[]
  answeredCount: number
  question: { index: number; total: number; text: string; unit: string } | null
  you: { role: 'host' | 'player'; playerId: string | null; answer: number | null }
  /** True after the host sends `show`. Until then, in `reveal`, players get `reveal: null` and scores without this round. */
  answerShown: boolean
  reveal: { correct: number; results: RevealResult[] } | null
}

export interface ServerError {
  type: 'error'
  code: string
  message: string
}

export type ClientMessage =
  | { type: 'join'; name: string; playerId?: string }
  | { type: 'answer'; value: number }
  | { type: 'start' }
  | { type: 'reveal' }
  | { type: 'show' }
  | { type: 'next' }
  | { type: 'kick'; playerId: string }
