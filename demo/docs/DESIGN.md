# Co-operative Coding: Style Reference
> Comic panels on a night pond

**Theme:** dark

Built for "Guess Closer!", the live quiz game in the Co-operative Coding Workshop (18 November 2026). The game has two surfaces: a host screen on a classroom projector and a phone in each player's hand. The working mockup is `mockup.html`, next to this file. The values below are measured from that file. Roles and recommendations are interpretation.

The system reads like a printed comic laid on a night pond. A flat navy field holds square panels with thick ink edges, halftone dot fills and hard offset shadows that do not blur. Type is loud and condensed for titles, plain and readable for questions, and monospaced for every number. Five colours do all the work, and each one has a single job. Teal is the pond and every action. Orange belongs to the winner. Red is for stickers and errors. White is paper and text. Navy is both the field and the ink. Each screen does one thing, and the projector screens must read from the back row of a classroom.

## Tokens: colours

| Name | Value | Token | Role |
|------|-------|-------|------|
| Night Navy | `#011627` | `--c-navy` | The field behind everything, and the ink: panel edges and text on teal, orange and white |
| Paper White | `#FDFFFC` | `--c-white` | Body text, the main button fill, speech bubbles, white shadows and outlines on navy |
| Pond Teal | `#2EC4B6` | `--c-teal` | The accent: actions, data, progress, focus rings, the reveal bar and teal shadows |
| Winner Orange | `#FF9F1C` | `--c-orange` | The winner only: one orange panel per screen, the crown and the winner's guess on the bar |
| Signal Red | `#C8102E` | `--c-red` | Stickers, error borders and warning icons. On navy, use it for large shapes only |
| Surface | `oklch(0.245 0.045 250)` | `--md-surface` | Plain rows, panels and inputs on the field |
| Surface 2 | `oklch(0.275 0.045 250)` | `--md-surface-2` | Halftone dots on the field |
| Surface 3 | `oklch(0.32 0.045 250)` | `--md-surface-3` | Dim shadow behind secondary panels |
| Border | `oklch(0.37 0.04 250)` | `--md-border` | Hairlines in the document chrome |
| Rule | `oklch(0.6 0.035 245)` | `--rule` | Outlines that carry meaning on the projector (4.67:1 on navy) |
| Soft Text | `oklch(0.87 0.02 240)` | `--md-soft` | Secondary text, units and meta rows |
| Muted Text | `oklch(0.74 0.03 240)` | `--md-muted` | Hints and fine print |
| Error Text | `oklch(0.7 0.17 22)` | `--red-text` | Small error text on navy, a lighter tint of Signal Red |

The five hex values are the whole palette. Every other value is a tint of navy or of red, made for contrast. Don't add a sixth colour.

### Contrast (measured)

| Pair | Ratio |
|------|-------|
| White on navy | 18.24:1 |
| Soft text on navy | 12.38:1 |
| Muted text on surface | 7.05:1 |
| Teal on navy, navy on teal | 8.46:1 |
| Orange on navy, navy on orange | 8.93:1 |
| White on red (stickers) | 5.85:1 |
| Error text on navy | 6.36:1 |
| Red on navy | 3.12:1 (large shapes only) |

## Tokens: typography

### Anton: display, titles and big numbers · `--font-display`
- **Source:** Google Fonts
- **Weights:** 400
- **Sizes:** 22 (sticker), 34–44 (units, counts), 64 (room code), 72 (phone title), 92–100 (host title), 104–128 (answer and count)
- **Line height:** 0.85–0.93
- **Letter spacing:** 0.02em for titles, 0.14em for the room code
- **Role:** The loud voice. Titles always stack two words: the first is filled, the second is outlined (`-webkit-text-stroke: 2.5px`). Use it for the answer, counts, the room code and the winner, never for a sentence.

### Switzer: questions, body text and button labels · `--font-body`
- **Source:** Fontshare
- **Weights:** 400, 500, 600, 700
- **Sizes:** 15–17 (phone body), 18–22 (host body, names), 26–34 (phone questions, staged question), 46 (host question)
- **Line height:** 1.1 for questions, 1.5 for body text
- **Letter spacing:** -0.01em for questions; 0.05em, upper case and 700 for buttons
- **Role:** Everything people must read. A long question stays in Switzer at projector size, because Anton gets hard to read across 2–3 lines.

### JetBrains Mono: data, meta rows and keys · `--font-mono`
- **Source:** Google Fonts
- **Weights:** 400, 500, 700
- **Sizes:** 13–14 (phone labels and chips), 16 (host meta rows, key caps, data lines), 20–24 (points, guesses)
- **Line height:** 1.0–1.2
- **Letter spacing:** 0.1em in upper case meta rows and stamps
- **OpenType features:** `tabular-nums` on every number
- **Role:** Data only: room code, question count, guesses, distances, points and key names. Don't use it as decoration.

### Caveat: sketches only
- **Weights:** 500
- **Role:** Hand-drawn wireframe labels in design documents. It never appears in the product.

### Type scale

| Role | Family | Weight | Size | Line height | Letter spacing | Token |
|------|--------|--------|------|-------------|----------------|-------|
| meta | JetBrains Mono | 500 | 16px | 1 | 0.1em | `--text-meta` |
| body | Switzer | 400 | 17px | 1.5 | 0 | `--text-body` |
| body-host | Switzer | 500 | 20px | 1.3 | 0 | `--text-body-host` |
| button | Switzer | 700 | 17–20px | 1 | 0.05em | `--text-button` |
| question-phone | Switzer | 600 | 27px | 1.2 | 0 | `--text-question-phone` |
| question-host | Switzer | 600 | 46px | 1.1 | -0.01em | `--text-question-host` |
| title-phone | Anton | 400 | 72px | 0.92 | 0.02em | `--text-title-phone` |
| title-host | Anton | 400 | 100px | 0.93 | 0.02em | `--text-title-host` |
| number | Anton | 400 | 112px | 0.85 | 0.02em | `--text-number` |

**Projector floor:** nothing a player or the host must read is smaller than 16px on a 960 × 540 frame. At 1080p that is 32px on the wall.

## Tokens: spacing and shapes

**Base unit:** 4px

**Density:** one idea per screen, with generous space around it

### Spacing scale

| Name | Value | Token |
|------|-------|-------|
| 8 | 8px | `--space-8` |
| 16 | 16px | `--space-16` |
| 24 | 24px | `--space-24` |
| 36 | 36px | `--space-36` |
| 48 | 48px | `--space-48` |
| 56 | 56px | `--space-56` |

### Border radius

| Element | Value |
|---------|-------|
| Panels, buttons, tags, inputs, stickers | 0 |
| Phone frame (the device, not the UI) | 36–44px |

Every corner in the UI is a square 90 degrees. This is the signature of the system.

### Edges and shadows

| Token | Value | Use |
|-------|-------|-----|
| `--edge` | `3px solid #011627` | The ink line between a panel's fill and its shadow |
| `--line` | `3px` | Outline weight of inputs, the reveal bar and focus |
| `--hair` | `2px` | Plain rows and stamps |
| `--pop` | `6px 6px 0 #2EC4B6` | Main actions, inputs, the QR card, the reveal bar |
| `--pop-sm` | `4px 4px 0 #2EC4B6` | Focused inputs, small bars |
| `--pop-paper` | `6px 6px 0 #FDFFFC` | Winner panel, second button, sticker, speech bubble |
| `--pop-dim` | `5px 5px 0 oklch(0.32 0.045 250)` | Secondary panels |

### Texture

| Token | Value | Use |
|-------|-------|-----|
| `--dots` | Navy dots at 16% opacity, 5px grid | Halftone fill on every painted panel |
| `--dots-faint` | Surface 2 dots, 9px grid | The screen field. Decoration only; it may disappear on a projector |
| Hatching | 45-degree navy lines over teal, 7px apart | Progress blocks, answer bars and the reveal fill |

## Components

### Main button
**Role:** The one action on a screen (start, reveal, fill, next, join, send)

White paper fill with halftone dots, a 3px navy edge, square corners and a teal `--pop` shadow. Label in Switzer 700, upper case, 0.05em tracking, navy. The arrow icon sits in a navy square at the right end. Height 56px (68px on the host). Hover lifts the panel 2px up and left, and the shadow grows to 8px. Pressing moves it 4px down and right, and the shadow shrinks to 2px. Focus is a 3px teal outline, offset by 3px.

### Second button
**Role:** The other action (change answer, try now, new game)

Teal paint with halftone dots, a 3px navy edge, navy label and a white `--pop-paper` shadow. It moves the same way as the main button. A screen has at most one of each kind.

### Winner panel
**Role:** The person who won the round or the game

Orange paint with halftone dots, a 3px navy edge, a white shadow and navy text. A crown icon or the rank sits on the left, and the points sit on the right in mono. There is one winner panel per screen, and nothing else is orange except the crown.

### Plain row
**Role:** Every other ranked player

Surface fill, a 2px `--rule` outline, no shadow. Rank in mono, name in Switzer 600, data in mono.

### Reveal bar
**Role:** The answer screen's one big moment

A vertical tube with a 3px white edge, a teal shadow and a navy inside. Its scale runs from the lowest to the highest guess, plus an 8% margin, so the stop height changes for every question. Each guess is a square beside the tube at its own height: 13px soft squares, and 19px white squares for the top 3 with their names. The winner's square is orange. Guesses outside the scale are counted at the ends ("2 guesses above"). The reveal has three stages:
1. Ready: the question, an outlined "?", the empty tube and all the guesses.
2. Filling: the host presses Space. The teal hatched fill rises in eased bursts while the tube shakes slightly, then it overshoots, wobbles and settles (2.2 seconds).
3. Done: the answer line, the number and the top 3 appear one after another.

### Count bar
**Role:** "21 of 28 answered" on the question screen

A horizontal tube with a white edge, a small teal shadow and a teal hatched fill. It shows a count only, never names.

### Sticker
**Role:** One comic accent per screen, at most (for example "10 questions", "Top duck")

Red paint with dots, a navy edge, a white shadow, white Anton 22px, upper case, rotated -5 degrees. Use it on the lobby and the final screen only.

### Speech bubble
**Role:** The duck talks (for example "You're in, Ada!")

White paper with dots, a navy edge, a teal shadow, navy Anton 30px. Its tail is a triangle with a navy edge, pointing at the duck.

### Stamp
**Role:** The step name in the centre of the host's top meta row (LOBBY, QUESTION 3 OF 10, ANSWER, GAME OVER)

Mono 16px, upper case, a 1.5px teal outline, teal text, no fill.

### Key cap
**Role:** Host controls in the bottom meta row

Mono 16px, 700, white text, a 2px white outline and a 2px teal offset shadow, followed by the action in mono. Every host screen shows the same three keys in the same order: Space (the main action), Backspace (back) and Esc (players).

### Progress blocks
**Role:** Question N of 10

A row of square blocks, 12px high (10px on the phone). Done: solid teal. Current: teal hatching inside a teal outline. Still to come: a `--rule` outline only.

### Input
**Role:** Room code, nickname, guess

Surface fill, a 3px muted outline, square corners. On focus the outline turns teal and gets a `--pop-sm` shadow. An error turns the outline red, with the message underneath in error text. The guess field is 88px high, with the unit in mono on the right.

### Projector frame
**Role:** Every host screen

960 × 540, padding 68px top, 56px sides, 60px bottom. Teal corner brackets, 28px, 3px. A top meta row holds real data only (room, step, count). A bottom meta row holds one line of help on the left and the key caps on the right.

## Do's and don'ts

### Do
- Keep every UI corner square.
- Give every painted panel all three parts: a navy edge, a halftone fill and a hard shadow.
- Put one main action on each screen, and drive the host screen with Space.
- Use orange for the winner only, once per screen.
- Show counts on the projector and send each player's own result to their phone.
- Restate the question on the answer screen.
- Use plain scoring words: "off by 3", not "3.4% off". Within one question, ranking by relative error gives the same order as plain distance.
- State the tie rule before it matters: "Same distance? Faster wins."
- Give every player an ending made for them: closest, beaten on time, no points, no answer, winner and mid-table.

### Don't
- Don't round a corner, except the phone frame.
- Don't blur a shadow, add a glow or use a gradient as a surface.
- Don't add a sixth colour, and don't use pure red for small text on navy.
- Don't put names of slow or wrong players on the projector.
- Don't show the answer before the reveal bar has settled.
- Don't use Anton for sentences or mono as decoration.
- Don't use more than one sticker on a screen, or any sticker on the question and answer screens.
- Don't put an eyebrow label above a heading.
- Don't let a stray Space wipe the scores: a new game needs Space twice.

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Night Navy field | `#011627` + faint dots | The page and every screen |
| 1 | Surface | `oklch(0.245 0.045 250)` | Plain rows, panels and inputs |
| 2 | Paper | `#FDFFFC` + dots | Main button, speech bubble |
| 3 | Teal paint | `#2EC4B6` + dots | Second button, fills, progress |
| 4 | Orange paint | `#FF9F1C` + dots | The winner panel |
| 5 | Red paint | `#C8102E` + dots | Stickers |

## Elevation

There is no soft elevation. Depth comes only from the hard offset shadow, which works like a printed panel lifted off the page. Press feedback moves the panel into its shadow. A panel with no shadow is flat and secondary.

## Imagery

The mascot is a teal duck, drawn as flat fills with white ink lines and no shading. It perches on things: the QR card in the lobby and the winner's panel at the end. It speaks in a speech bubble on the waiting screen. Icons come from Phosphor only, filled, in the colour of their role. There are no photographs.

The mockup duck is a placeholder. The final comic ducks are in `../frontend/public/ducks/`.

## Layout

- **Projector:** a 16:9 frame with two columns. The left column holds the message (title, question or answer) and the one main action. The right column holds the evidence (the QR code, the count bar, the reveal bar or the board). Meta rows sit at the top and bottom, inside the corner brackets.
- **Phone:** one column, 22px side padding, and one task per screen. The action sits directly under the field it belongs to, so the keyboard never covers it. The player's name and points are at the top.
- **Class size:** built for 30 players, the contract's room limit. The lobby shows a count and one name list ("and 14 more"). The answer screen names the top 3, and the final screen the top 5. Everyone else is sent to their phone.

## Motion

- **Easing:** `cubic-bezier(0.19, 1, 0.22, 1)` for state changes, 150–250ms.
- **One moment per screen.** The reveal bar is the main one: bursts eased with `cubic-bezier(.3,.9,.4,1)`, a tube shake of ±0.8 degrees, an overshoot of 4%, then it settles at 2.2 seconds. The top 3 land afterwards, 120ms apart.
- **Buttons:** 90ms transform and shadow on hover and press.
- **Reduced motion:** the bar jumps to its final state, and nothing shakes or slides.

## Agent prompt guide

**Quick colour reference**
- Field: `#011627`
- Text on navy: `#FDFFFC` (secondary `oklch(0.87 0.02 240)`)
- Text on teal, orange and white: `#011627`
- Text on red: `#FDFFFC`
- Main action: white paper, navy edge, teal shadow
- Accent: `#2EC4B6`
- Winner: `#FF9F1C`, once per screen

**Three example prompts**

1. **Projector lobby:** 960 × 540 frame on `#011627` with a faint 9px dot grid and teal corner brackets. Top meta row in JetBrains Mono 16px, upper case: "ROOM KQWZ", a teal-outlined stamp "LOBBY", "28 JOINED". Left column: "CLOSEST" (Anton 92px, white) over "NUMBER" (Anton, outlined in white), line height 0.93. Below it, a Switzer 20px line in soft text, a teal Anton count "28" with "ducks in the pond", one line of names, then a main button "START GAME". Right column: a white QR card with a navy edge and a 6px teal shadow, then the room code in teal Anton 64px. Bottom row: key caps for Space, Backspace and Esc.

2. **Answer screen, done:** left column with the question in Switzer 20px, "88" in teal Anton 112px with "KEYS" in Anton 38px, then three rows: an orange winner panel with dots, navy edge and white shadow ("Ada · 85 · off by 3 · +3"), and two plain rows. Right column: a vertical tube with a white 3px edge and teal shadow, filled with teal hatching up to the answer line, with every guess as a small square beside it and the top 3 named.

3. **Phone result:** 360px wide, navy field. The question in Switzer 15px, then "88" in teal Anton 112px with "KEYS" on the baseline. Below it, an orange panel with dots, a navy edge and a white shadow: "You said 85 · off by 3", then "1ST" in Anton 48px and "+3" in mono. One line of soft text underneath.

## Quick start

### CSS custom properties

```css
:root {
  /* Palette */
  --c-navy: #011627;
  --c-white: #FDFFFC;
  --c-teal: #2EC4B6;
  --c-orange: #FF9F1C;
  --c-red: #C8102E;

  /* Navy tints */
  --md-bg: var(--c-navy);
  --md-surface: oklch(0.245 0.045 250);
  --md-surface-2: oklch(0.275 0.045 250);
  --md-surface-3: oklch(0.32 0.045 250);
  --md-border: oklch(0.37 0.04 250);
  --md-text: var(--c-white);
  --md-soft: oklch(0.87 0.02 240);
  --md-muted: oklch(0.74 0.03 240);
  --rule: oklch(0.6 0.035 245);
  --red-text: oklch(0.7 0.17 22);

  /* Roles */
  --accent: var(--c-teal);
  --accent-ink: var(--c-navy);
  --winner: var(--c-orange);
  --sticker: var(--c-red);
  --paper: var(--c-white);
  --ink: var(--c-navy);

  /* Type */
  --font-display: Anton, Impact, 'Arial Narrow', sans-serif;
  --font-body: Switzer, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, Consolas, monospace;
  --text-meta: 16px;
  --text-body: 17px;
  --text-body-host: 20px;
  --text-question-phone: 27px;
  --text-question-host: 46px;
  --text-title-phone: 72px;
  --text-title-host: 100px;
  --text-number: 112px;

  /* Spacing */
  --space-8: 8px;
  --space-16: 16px;
  --space-24: 24px;
  --space-36: 36px;
  --space-48: 48px;
  --space-56: 56px;

  /* Shape, edges and shadows */
  --r-card: 0;
  --r-full: 0;
  --line: 3px;
  --hair: 2px;
  --edge: 3px solid var(--ink);
  --pop: 6px 6px 0 var(--accent);
  --pop-sm: 4px 4px 0 var(--accent);
  --pop-paper: 6px 6px 0 var(--paper);
  --pop-dim: 5px 5px 0 var(--md-surface-3);

  /* Texture */
  --dots: radial-gradient(color-mix(in oklab, var(--ink) 16%, transparent) 1px, transparent 1.4px) 0 0 / 5px 5px;
  --dots-faint: radial-gradient(var(--md-surface-2) 1.1px, transparent 1.5px) 0 0 / 9px 9px;
  --hatch: repeating-linear-gradient(-45deg, transparent 0 7px, color-mix(in oklab, var(--accent-ink) 55%, transparent) 7px 10px);

  /* Motion */
  --ease-out: cubic-bezier(0.19, 1, 0.22, 1);
}
```

### Tailwind v4

```css
@theme {
  --color-navy: #011627;
  --color-white: #FDFFFC;
  --color-teal: #2EC4B6;
  --color-orange: #FF9F1C;
  --color-red: #C8102E;
  --color-surface: oklch(0.245 0.045 250);
  --color-surface-2: oklch(0.275 0.045 250);
  --color-surface-3: oklch(0.32 0.045 250);
  --color-soft: oklch(0.87 0.02 240);
  --color-muted: oklch(0.74 0.03 240);
  --color-rule: oklch(0.6 0.035 245);
  --color-red-text: oklch(0.7 0.17 22);

  --font-display: Anton, Impact, 'Arial Narrow', sans-serif;
  --font-body: Switzer, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, Consolas, monospace;

  --radius-*: initial;
  --radius-none: 0;

  --shadow-*: initial;
  --shadow-pop: 6px 6px 0 #2EC4B6;
  --shadow-pop-sm: 4px 4px 0 #2EC4B6;
  --shadow-pop-paper: 6px 6px 0 #FDFFFC;

  --ease-out: cubic-bezier(0.19, 1, 0.22, 1);
}
```

### Fonts

```html
<link href="https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700&display=swap" rel="stylesheet">
```
