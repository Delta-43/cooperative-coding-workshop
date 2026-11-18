import { Water } from '../water/Water'
import { usePour } from '../water/usePour'

/**
 * A glass beaker that fills to `level` over five seconds with a rough, bubbly surface,
 * jitters for three more seconds, then calms. The water stays.
 */
export function Beaker({ level, label }: { level: number; label: string }) {
  const pour = usePour()

  return (
    <div className="beaker" role="img" aria-label={label}>
      <div className="beaker-glass">
        <Water
          level={level}
          fillSeconds={pour.fillSeconds}
          agitation={pour.agitation}
          bubbles={pour.bubbles}
          className="beaker-water"
        />
        <span className="beaker-ticks" aria-hidden="true" />
        <span className="beaker-shine" aria-hidden="true" />
      </div>
    </div>
  )
}
