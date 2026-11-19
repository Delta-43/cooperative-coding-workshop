import { Water } from '../water/Water'

/**
 * The game's progress along the bottom: a glass tube that fills from the left.
 * Each step pours more water in; the front edge sloshes and settles.
 */
export function WaterProgress({ done, total, label }: { done: number; total: number; label: string }) {
  const fraction = total > 0 ? Math.min(1, Math.max(0, done / total)) : 0
  return (
    <div
      className="tube"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-label={label}
    >
      <div className="tube-fill" style={{ width: `${Math.max(fraction * 100, 4)}%` }}>
        <Water level={0.72} bubbles splashKey={done} className="tube-water" />
      </div>
      <span className="tube-label">{label}</span>
    </div>
  )
}
