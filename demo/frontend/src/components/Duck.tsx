// The game mascot: a comic-book green-winged teal, drawn for this workshop (public/ducks/).
// Each screen gets its own pose, so the duck reacts to what is happening.
export type DuckPose = 'flying' | 'landing' | 'swimming' | 'cheering' | 'shrug' | 'puzzled'

export function Duck({ pose }: { pose: DuckPose }) {
  return <img className="duck" src={`${import.meta.env.BASE_URL}ducks/comic-${pose}.webp`} alt="" draggable={false} />
}
