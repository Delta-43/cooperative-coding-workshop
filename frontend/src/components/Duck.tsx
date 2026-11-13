// The workshop mascot: an engraved green-winged teal, drawn for this workshop (frontend/public/ducks/).
export type DuckPose = 'standing' | 'swimming' | 'pair'

export function Duck({ pose = 'standing' }: { pose?: DuckPose }) {
  return <img className="duck" src={`${import.meta.env.BASE_URL}ducks/duck-${pose}.webp`} alt="" draggable={false} />
}
