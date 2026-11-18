import { Water } from './water/Water'

// Calm water along the bottom of the screen, with the odd bubble.
export function Pond() {
  return (
    <div className="pond" aria-hidden="true">
      <Water level={0.78} bubbles className="pond-water" />
    </div>
  )
}
