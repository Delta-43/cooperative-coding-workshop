import { useState, type CSSProperties } from 'react'
import { Duck, type DuckPose } from '../ducks'

// Poses a bird can settle into once it has landed on a card.
const PERCHED: DuckPose[] = ['swimming', 'cheering', 'puzzled', 'shrug', 'landing']

// Where on the card a bird may land: [left %, which way it arrives from].
const SPOTS = [
  { left: 6, from: -1 },
  { left: 64, from: 1 },
  { left: 38, from: -1 },
  { left: 72, from: -1 },
  { left: 12, from: 1 },
] as const

// A small seeded random, so one question always gets the same bird on every screen.
function seeded(seed: number) {
  let x = (seed + 1) * 2654435761
  return () => {
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    return ((x >>> 0) % 10000) / 10000
  }
}

/**
 * A bird that flies onto the card, settles, and flies off forwards when `leaving`
 * turns true, before the card itself moves away.
 */
export function Bird({ seed, leaving }: { seed: number; leaving: boolean }) {
  const [bird] = useState(() => {
    const rand = seeded(seed)
    const spot = SPOTS[Math.floor(rand() * SPOTS.length)]
    return {
      pose: PERCHED[Math.floor(rand() * PERCHED.length)],
      spot,
      exit: rand() < 0.5 ? -1 : 1,
    }
  })
  const [landed, setLanded] = useState(false)

  const flying = leaving || !landed
  const direction = leaving ? bird.exit : -bird.spot.from
  const style = {
    left: `${bird.spot.left}%`,
    '--from': bird.spot.from,
    '--exit': bird.exit,
  } as CSSProperties

  return (
    <div
      className={`bird ${leaving ? 'bird-leaving' : landed ? 'bird-perched' : 'bird-arriving'}`}
      style={style}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && !leaving) setLanded(true)
      }}
    >
      <div className={direction < 0 && flying ? 'bird-face-left' : undefined}>
        <Duck pose={flying ? 'flying' : bird.pose} className="bird-img" />
      </div>
    </div>
  )
}
