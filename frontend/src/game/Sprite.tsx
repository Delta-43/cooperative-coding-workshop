import { useEffect, useRef } from 'react'
import { SHEET, assetUrl, type Range, type Species } from './birds'

export type SpriteMode = 'arrive' | 'fly' | 'idle' | 'leave'

const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Plays part of a bird's sprite sheet. `idle` goes back and forth so it never jumps;
 * `arrive` and `leave` play once (a looping leave keeps flapping while it is carried off).
 * Frames are set straight on the element, so playing costs no React renders.
 */
export function Sprite({
  species,
  mode,
  mirrored,
  onDone,
}: {
  species: Species
  mode: SpriteMode
  mirrored: boolean
  onDone?: () => void
}) {
  const el = useRef<HTMLDivElement>(null)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  }, [onDone])

  useEffect(() => {
    const node = el.current
    if (!node) return
    const show = (frame: number) => {
      const col = frame % SHEET.cols
      const row = Math.floor(frame / SHEET.cols)
      node.style.backgroundPosition = `${(col / (SHEET.cols - 1)) * 100}% ${(row / (SHEET.rows - 1)) * 100}%`
    }

    const range: Range =
      mode === 'leave'
        ? species.leave
        : mode === 'arrive'
          ? (species.arrive ?? species.idle)
          : mode === 'fly'
            ? (species.flight ?? species.idle)
            : species.idle
    // Idle goes back and forth; flying and a looping leave go round; arriving and leaving play once.
    const loops = mode === 'fly' || (mode === 'leave' && species.leaveLoops)
    const [first, last] = range

    if (reducedMotion()) {
      show(species.idle[0])
      if (mode === 'arrive' || mode === 'leave') {
        const id = setTimeout(() => done.current?.(), 0)
        return () => clearTimeout(id)
      }
      return
    }

    // Leaving is a touch quicker, so the bird is gone before the card moves.
    const fps = mode === 'leave' ? SHEET.fps * 1.4 : SHEET.fps
    let frame = first
    let step = 1
    show(frame)
    const id = setInterval(() => {
      if (mode === 'idle') {
        if (frame + step > last || frame + step < first) step = -step
        frame += step
      } else if (frame < last) {
        frame += 1
      } else if (loops) {
        frame = first
      } else {
        clearInterval(id)
        done.current?.()
        return
      }
      show(frame)
    }, 1000 / fps)
    return () => clearInterval(id)
  }, [species, mode])

  return (
    <div
      ref={el}
      className={`sprite${mirrored ? ' is-mirrored' : ''}`}
      style={{
        backgroundImage: `url(${assetUrl(species.sheet)})`,
        backgroundSize: `${SHEET.cols * 100}% ${SHEET.rows * 100}%`,
        aspectRatio: String(SHEET.aspect),
      }}
    />
  )
}
