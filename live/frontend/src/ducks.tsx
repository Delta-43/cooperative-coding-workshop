// The bird collection. More species (muscovy, goose, puffin, bath duck, Peking duck)
// arrive from Alban: drop the files in public/ducks/ and add a line here.

const DUCKS = {
  cheering: 'ducks/comic-cheering.webp',
  flying: 'ducks/comic-flying.webp',
  landing: 'ducks/comic-landing.webp',
  puzzled: 'ducks/comic-puzzled.webp',
  shrug: 'ducks/comic-shrug.webp',
  swimming: 'ducks/comic-swimming.webp',
} as const

export type DuckPose = keyof typeof DUCKS

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`

export function Duck({ pose, className = 'duck' }: { pose: DuckPose; className?: string }) {
  return <img className={className} src={assetUrl(DUCKS[pose])} alt="" aria-hidden="true" />
}
