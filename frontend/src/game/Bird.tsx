import { useState, type CSSProperties } from 'react'
import { SPECIES } from './birds'
import { Sprite } from './Sprite'

// Where on the card a bird may land, as % from the left.
const SPOTS = [6, 64, 38, 72, 12, 50] as const

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
 * One of Alban's birds on the card. It flies in forwards from behind, settles and plays
 * its own little loop, and when `leaving` turns true (before the card moves) it carries on
 * forwards and off the screen.
 */
export function Bird({ seed, leaving }: { seed: number; leaving: boolean }) {
  const [bird] = useState(() => {
    const rand = seeded(seed)
    const species = SPECIES[Math.floor(rand() * SPECIES.length)]
    const heading = rand() < 0.5 ? -1 : 1
    return { species, heading, left: SPOTS[Math.floor(rand() * SPOTS.length)] }
  })
  const [landed, setLanded] = useState(false)
  const { species, heading } = bird

  const style = {
    left: `${bird.left}%`,
    // It arrives from behind and leaves ahead, always moving the way it faces.
    '--from': -heading,
    '--exit': heading,
  } as CSSProperties

  return (
    <div
      className={`bird bird-${species.id}${species.flying ? ' is-flying' : ''} ${
        leaving ? 'bird-leaving' : landed ? 'bird-perched' : 'bird-arriving'
      }`}
      style={style}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && !leaving) setLanded(true)
      }}
    >
      <Sprite species={species} mirrored={species.faces !== heading} />
    </div>
  )
}
