import type { CSSProperties } from 'react'
import { SHEET, assetUrl, type Species } from './birds'

/**
 * Plays a bird's sprite sheet with CSS only: the inner image steps along a row every
 * sixth of the loop while its wrapper steps down a row every loop. Both run on the
 * compositor, so a perched bird costs almost nothing.
 */
export function Sprite({ species, mirrored }: { species: Species; mirrored: boolean }) {
  const style = {
    '--aspect': `${species.width} / ${species.height}`,
    '--loop': `${SHEET.seconds}s`,
  } as CSSProperties
  return (
    <div className={`sprite${mirrored ? ' is-mirrored' : ''}`} style={style}>
      <div className="sprite-rows">
        <img className="sprite-sheet" src={assetUrl(species.sheet)} alt="" draggable={false} />
      </div>
    </div>
  )
}
