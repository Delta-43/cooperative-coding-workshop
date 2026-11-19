import type { CSSProperties } from 'react'
import { Water } from '../water/Water'
import { usePour } from '../water/usePour'

export interface GlassEntry {
  id: string
  name: string
  /** 1 is spot on, 0 is off by the whole answer or more. */
  closeness: number
}

// Name tags closer than this (in % of the glass) are pushed apart so they stay readable.
const MIN_GAP = 9

/** Where each name tag sits, top to bottom, without overlapping. */
function placeTags(entries: GlassEntry[]) {
  const sorted = [...entries].sort((a, b) => b.closeness - a.closeness)
  const placed: { entry: GlassEntry; top: number }[] = []
  for (const entry of sorted) {
    const ideal = (1 - entry.closeness) * 100
    const prev = placed[placed.length - 1]
    placed.push({ entry, top: prev ? Math.max(ideal, prev.top + MIN_GAP) : ideal })
  }
  // If the stack ran past the bottom, walk back up so each tag keeps its gap.
  for (let i = placed.length - 1; i >= 0; i--) {
    const below = placed[i + 1]
    placed[i].top = Math.min(placed[i].top, below ? below.top - MIN_GAP : 100)
  }
  return placed
}

/**
 * The results glass on the right of the big screen. Water pours up to the closest guess;
 * each player's name sits at the height of their own guess, and an arrow rolls up the
 * side from the furthest guess to the closest.
 */
export function ClosenessGlass({
  entries,
  pointedId,
  step,
}: {
  entries: GlassEntry[]
  pointedId: string | null
  step: number
}) {
  const pour = usePour()
  const best = entries.reduce((m, e) => Math.max(m, e.closeness), 0)
  const tags = placeTags(entries)
  const pointed = tags.find((t) => t.entry.id === pointedId)

  return (
    <figure className="glass-meter" aria-label="How close each guess was">
      <div className="glass-scale">
        <span className="glass-exact">Spot on</span>
        {tags.map(({ entry, top }) => (
          <span
            key={entry.id}
            className={`glass-tag${entry.id === pointedId ? ' is-pointed' : ''}`}
            style={{ top: `${top}%` }}
          >
            {entry.name}
          </span>
        ))}
        {pointed && (
          <span
            className="glass-arrow"
            aria-hidden="true"
            style={{ top: `${pointed.top}%`, '--step': step } as CSSProperties}
          />
        )}
      </div>
      <div className="glass-tube">
        <Water
          level={Math.max(best, 0.03)}
          fillSeconds={pour.fillSeconds}
          agitation={pour.agitation}
          bubbles={pour.bubbles}
          stream={pour.stream}
          className="glass-water"
        />
        <span className="glass-ticks" aria-hidden="true" />
        <span className="glass-shine" aria-hidden="true" />
      </div>
    </figure>
  )
}
