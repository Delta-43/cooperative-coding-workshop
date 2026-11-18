// Alban's birds, cut out of their videos into 6×6 sprite sheets (36 frames over 6 seconds).
// `faces` is the way the drawing looks: 1 right, -1 left. Mirroring turns it round.

export interface Species {
  id: string
  name: string
  sheet: string
  /** One frame's size in the sheet, in pixels. */
  width: number
  height: number
  faces: 1 | -1
  /** Drawn in flight: it hovers over the card rather than standing on it. */
  flying?: boolean
}

export const SHEET = { cols: 6, rows: 6, seconds: 6.04 }

export const SPECIES: Species[] = [
  { id: 'peking', name: 'Imperial Peking duck', sheet: 'birds/peking.webp', width: 167, height: 220, faces: -1 },
  { id: 'bath-duck', name: 'Yellow bath duck', sheet: 'birds/bath-duck.webp', width: 222, height: 220, faces: 1 },
  { id: 'puffin', name: 'Puffin', sheet: 'birds/puffin.webp', width: 166, height: 220, faces: 1 },
  { id: 'goose', name: 'Goose', sheet: 'birds/goose.webp', width: 240, height: 212, faces: -1 },
  { id: 'teal', name: 'Teal', sheet: 'birds/teal-flying.webp', width: 240, height: 172, faces: 1, flying: true },
]

export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`
