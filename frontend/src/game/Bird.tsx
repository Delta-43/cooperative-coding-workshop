import { useState, type CSSProperties } from 'react'
import { SPECIES } from './birds'
import { Sprite } from './Sprite'

// Where on the card a bird may land, as % from the left.
const SPOTS = [2, 58, 30, 64, 8, 44] as const

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
 * One of Alban's birds on the card, playing its own video. It arrives (flying in from
 * behind, or with its own entrance), plays its standing-about part while perched, and when
 * `leaving` turns true it plays its take-off and flies off forwards before the card moves.
 * Every video takes off to the right, so a bird heading left is mirrored.
 */
export function Bird({ seed, leaving }: { seed: number; leaving: boolean }) {
  const [bird] = useState(() => {
    const rand = seeded(seed)
    const species = SPECIES[Math.floor(rand() * SPECIES.length)]
    const heading = rand() < 0.5 ? -1 : 1
    return { species, heading, left: SPOTS[Math.floor(rand() * SPOTS.length)] }
  })
  const { species, heading } = bird
  const ownEntrance = Boolean(species.arrive)
  const [landed, setLanded] = useState(false)

  const mode = leaving ? 'leave' : landed ? 'idle' : ownEntrance ? 'arrive' : 'fly'
  const style = {
    left: `${bird.left}%`,
    // It arrives from behind and leaves ahead, always moving the way it faces.
    '--from': -heading,
    '--exit': heading,
  } as CSSProperties

  const flight = leaving
    ? species.leaveLoops
      ? 'bird-carried'
      : 'bird-takes-off'
    : landed || ownEntrance
      ? 'bird-perched'
      : 'bird-arriving'

  return (
    <div
      className={`bird bird-${species.id} ${flight}`}
      style={style}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && !leaving && !ownEntrance) setLanded(true)
      }}
    >
      <Sprite
        species={species}
        mode={mode}
        mirrored={heading < 0}
        onDone={mode === 'arrive' ? () => setLanded(true) : undefined}
      />
    </div>
  )
}
