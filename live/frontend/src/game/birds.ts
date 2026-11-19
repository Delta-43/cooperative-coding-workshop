// Alban's birds. Each video is a little story (stand about, show off, take off and fly out to
// the right), cut into a 9×8 sprite sheet of 72 full frames at 12 frames a second.
// Frame ranges below split each story into what the bird does on the card.

export type Range = readonly [first: number, last: number]

export interface Species {
  id: string
  name: string
  sheet: string
  /** Played back and forth while the bird sits on the card. */
  idle: Range
  /** Played once when the card is about to move: the take-off. */
  leave: Range
  /** The bird brings its own entrance (it slides in on its own); no fly-in arc. */
  arrive?: Range
  /** Flying frames, looped while it flies in along the arc. Without them it arrives as it stands. */
  flight?: Range
  /** The leave frames fly on the spot, so the bird is carried away while they loop. */
  leaveLoops?: boolean
}

export const SHEET = { cols: 9, rows: 8, frames: 72, fps: 12, aspect: 3 / 2 }

export const SPECIES: Species[] = [
  // Waddles, turns to face us, spreads its wings; takes off and flies out to the right.
  { id: 'peking', name: 'Imperial Peking duck', sheet: 'birds/peking.webp', idle: [0, 50], leave: [51, 71] },
  // Slides in from the left, blinks and quacks; waddles and dashes off with speed lines.
  { id: 'bath-duck', name: 'Yellow bath duck', sheet: 'birds/bath-duck.webp', arrive: [1, 9], idle: [10, 44], leave: [47, 67] },
  // Stands and turns its head; flies on the spot.
  { id: 'puffin', name: 'Puffin', sheet: 'birds/puffin.webp', flight: [20, 35], idle: [0, 13], leave: [20, 35], leaveLoops: true },
  // Flaps, turns to face us, spreads its wings; takes off and flies out to the right.
  { id: 'goose', name: 'Goose', sheet: 'birds/goose.webp', idle: [0, 44], leave: [47, 70] },
  // Always flying: sideways, then hovering face-on with wings spread, then away.
  { id: 'teal', name: 'Teal', sheet: 'birds/teal.webp', flight: [0, 18], idle: [27, 52], leave: [56, 63], leaveLoops: true },
]

export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`
