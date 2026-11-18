// Types for the messages in contract/messages.md. The contract is the agreement:
// change it there first, then here.

export type Phase = 'lobby' | 'question' | 'reveal' | 'over'

export type ErrorCode =
  | 'bad_message'
  | 'wrong_phase'
  | 'not_allowed'
  | 'name_taken'
  | 'bad_name'
  | 'room_full'
  | 'no_room'
  | 'time_up'

export interface Player {
  id: string
  name: string
  score: number
  time: number
  connected: boolean
  answered: boolean
}

export interface Fact {
  text: string
  source: string | null
}

export interface Question {
  index: number
  total: number
  text: string
  unit: string
  // Added by the timer and facts contract change (PR 22). Optional until it merges.
  timeLimit?: number
  endsAt?: number
  serverTime?: number
  fact?: Fact | null
}

export interface Result {
  playerId: string
  name: string
  value: number | null
  error: number | null
  time: number | null
  rank: number | null
  points: number
}

export interface GameState {
  type: 'state'
  code: string
  phase: Phase
  players: Player[]
  answeredCount: number
  question: Question | null
  you: { role: 'host' | 'player'; playerId: string | null; answer: number | null }
  answerShown: boolean
  reveal: { correct: number; results: Result[] } | null
}

export interface ServerError {
  type: 'error'
  code: ErrorCode
  message: string
}

export type ClientMessage =
  | { type: 'join'; name: string; playerId?: string }
  | { type: 'answer'; value: number }
  | { type: 'start' | 'reveal' | 'show' | 'next' }
  | { type: 'kick'; playerId: string }

export const MAX_NAME = 16
export const CODE_PATTERN = /^[A-Z]{4}$/
