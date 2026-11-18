import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Bird } from './Bird'

// How long the bird takes to fly off before the cards move.
const BIRD_HEAD_START = 1500

const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * A rolodex of question cards. The current card sits in the middle, two used cards
 * fade away on the left and two blank cards wait on the right. When `index` moves on,
 * the bird leaves first, then the whole stack slides one place to the left.
 */
export function CardStack({
  index,
  total,
  renderCard,
}: {
  index: number
  total: number
  renderCard: (i: number, isCurrent: boolean) => ReactNode
}) {
  const [shown, setShown] = useState(index)
  const changing = shown !== index

  useEffect(() => {
    if (index === shown) return
    const id = setTimeout(() => setShown(index), reducedMotion() ? 0 : BIRD_HEAD_START)
    return () => clearTimeout(id)
  }, [index, shown])

  const cards: number[] = []
  for (let i = Math.max(0, shown - 2); i <= Math.min(total - 1, shown + 2); i++) cards.push(i)

  return (
    <div className="stack" aria-live="polite">
      {cards.map((i) => {
        const slot = i - shown
        const isCurrent = slot === 0
        return (
          <article
            key={i}
            className={`stack-card card${isCurrent ? ' is-current' : slot < 0 ? ' is-past' : ' is-future'}`}
            style={{ '--slot': slot, '--abs': Math.abs(slot) } as CSSProperties}
            aria-hidden={!isCurrent}
            inert={!isCurrent}
          >
            {isCurrent && <Bird key={i} seed={i} leaving={changing} />}
            {renderCard(i, isCurrent)}
          </article>
        )
      })}
    </div>
  )
}
