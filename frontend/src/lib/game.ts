import { formatNumber } from '@/lib/api'
import type { PlayerInfo, RevealResult } from '@/types'

export function ordinal(n: number): string {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  return n + ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th')
}

/** "off by 3". Inside one question, plain distance ranks players in the same order as relative error. */
export function offBy(value: number, correct: number): string {
  return `off by ${formatNumber(Math.abs(value - correct))}`
}

/** Sizes a big number so long answers still fit: "88" stays huge, "1,000,000" steps down. */
export function sizeClass(text: string): string {
  if (text.length > 7) return 'small'
  if (text.length > 4) return 'mid'
  return ''
}

/** The player just above `me` with the same error, if `me` lost the place on time. */
export function beatenOnTime(results: RevealResult[], me: RevealResult): { name: string; seconds: number } | null {
  if (me.rank === null || me.rank === 1 || me.error === null) return null
  const above = results.find((r) => r.rank === me.rank! - 1)
  if (!above || above.error !== me.error) return null
  const seconds = Math.max(1, Math.round(((me.time ?? 0) - (above.time ?? 0)) / 1000))
  return { name: above.name, seconds }
}

/** Standings during a game: more points first, then the lower total time (the contract's final order). */
export function standings(players: PlayerInfo[]): PlayerInfo[] {
  return [...players].sort((a, b) => b.score - a.score || a.time - b.time)
}

/** A list of names that fits on one or two lines, then "and N more". */
export function nameCloud(names: string[], budget = 100): { shown: string; more: number } {
  let shown = ''
  let count = 0
  for (const name of names) {
    const next = shown ? `${shown} · ${name}` : name
    if (next.length > budget) break
    shown = next
    count++
  }
  return { shown, more: names.length - count }
}

export interface Mark {
  bottom: number
  lvl: number
}
export interface TopMark {
  bottom: number
  name: string
  value: number
  first: boolean
  nudge: number
}
export interface MeterLayout {
  lo: number
  hi: number
  to: number
  marks: Mark[]
  top: TopMark[]
  above: number
  below: number
}

/**
 * The reveal bar. The scale runs from the lowest to the highest guess near the answer (plus 8%),
 * so the bar stops at a different height every question. Wild guesses are counted at the ends.
 */
export function meterLayout(results: RevealResult[], correct: number, tubePx = 350): MeterLayout {
  const guesses = results.filter((r) => r.value !== null) as (RevealResult & { value: number })[]
  const span = Math.max(Math.abs(correct), 1)
  const near = (v: number) => Math.abs(v - correct) <= span * 3
  const inliers = guesses.filter((g) => near(g.value)).map((g) => g.value)
  let lo = Math.min(correct, ...inliers)
  let hi = Math.max(correct, ...inliers)
  if (hi === lo) {
    lo = correct - span * 0.5
    hi = correct + span * 0.5
  }
  const pad = (hi - lo) * 0.08
  lo -= pad
  hi += pad
  if (correct >= 0 && lo < 0 && Math.min(...inliers, correct) >= 0) lo = 0
  const pos = (v: number) => Math.round(((v - lo) / (hi - lo)) * 1000) / 10

  const placed: Mark[] = []
  const top3 = guesses.filter((g) => g.rank !== null && g.rank <= 3)
  for (const g of guesses) {
    if (!near(g.value) || top3.includes(g)) continue
    const bottom = pos(g.value)
    let lvl = 0
    while (placed.some((p) => p.lvl === lvl && Math.abs(p.bottom - bottom) < 4.5)) lvl++
    placed.push({ bottom, lvl: Math.min(lvl, 8) })
  }

  // Top 3 labels: keep at least 22px between them so names never collide.
  const top = top3
    .filter((g) => near(g.value))
    .map((g) => ({ bottom: pos(g.value), name: g.name, value: g.value, first: g.rank === 1, nudge: 0 }))
    .sort((a, b) => b.bottom - a.bottom)
  const minGap = (22 / tubePx) * 100
  for (let i = 1; i < top.length; i++) {
    const labelAbove = top[i - 1].bottom - (top[i - 1].nudge / tubePx) * 100
    const gap = labelAbove - top[i].bottom
    if (gap < minGap) top[i].nudge = Math.round(((minGap - gap) / 100) * tubePx)
  }

  return {
    lo,
    hi,
    to: pos(correct),
    marks: placed,
    top,
    above: guesses.filter((g) => !near(g.value) && g.value > correct).length,
    below: guesses.filter((g) => !near(g.value) && g.value < correct).length,
  }
}
