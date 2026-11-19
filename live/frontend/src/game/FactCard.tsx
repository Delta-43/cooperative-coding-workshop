import { useEffect, useState } from 'react'
import type { Fact } from '../contract'

const ROTATE_MS = 20_000

// Shown when the question has no fact of its own. None of these give an answer away.
const POND_FACTS: Fact[] = [
  { text: 'Warm and cold blood vessels run side by side in a duck’s legs, so its feet stay cold and it loses little heat standing on ice.', source: null },
  { text: 'Puffins can hold a dozen or more small fish crosswise in their beaks at once.', source: null },
  { text: 'Geese fly in a V so each bird rides the lifting air from the wingtip of the one ahead.', source: null },
  { text: 'Muscovy ducks are one of the few ducks that roost in trees.', source: null },
  { text: 'The yellow rubber duck became a bath toy in the late 1800s, when rubber could first be moulded.', source: null },
]

/**
 * "Did you know?" while players wait. Rotates through the facts every 20 seconds.
 * Falls back to pond facts when the question has none.
 */
export function FactCard({ facts }: { facts: Fact[] }) {
  const own = facts.length > 0
  const list = own ? facts : POND_FACTS
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (list.length < 2) return
    const id = setInterval(() => setTick((n) => n + 1), ROTATE_MS)
    return () => clearInterval(id)
  }, [list.length])

  const fact = list[tick % list.length]
  return (
    <aside className="fact" aria-live="polite">
      <span className="fact-label">{own ? 'Did you know?' : 'Pond fact'}</span>
      <p key={tick} className="fact-text">
        {fact.text}
      </p>
      {fact.source && (
        <a className="fact-source" href={fact.source} target="_blank" rel="noreferrer">
          Source
        </a>
      )}
    </aside>
  )
}
