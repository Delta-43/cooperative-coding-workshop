# Guess Closer!: frontend

The host screen and the phone screens for Guess Closer!. React, TypeScript and Vite, published to GitHub Pages.

## Run it

```sh
npm ci
npm run dev        # http://localhost:5173
```

- Host: open `#/host` on the projector laptop and create a room.
- Players: scan the QR code, or open the site and type the room code.

The frontend talks to the live Worker by default. To use another one, set `VITE_BACKEND_URL` (for example `http://localhost:8787` with `npm run dev` in `backend/`).

## Host controls

| Key | Action |
|---|---|
| Space (or a clicker's next key) | The main action: start, reveal, fill the bar, next question. On the final screen, press it twice for a new game |
| Backspace (or the clicker's back key) | Step back on the host screen: replay the answer bar, or cancel the new-game question |
| Esc | Open the players menu, where you can remove a player |

Backspace does not undo scores on the server: the contract has no message for that.

## Design

The look follows the design system in the private workshop repository (`DESIGN.md`): comic panels on a navy field, five colours, square corners, halftone dots and hard offset shadows. All of it is in `src/styles/game.css`. The duck is a placeholder until the workshop theme is ready.

## Publish

`.github/workflows/pages.yml` builds and publishes this folder on every push to `main` that changes it. Optional repository variables:

- `BACKEND_URL`: a different Worker.
- `SHORT_URL`: a short join link (for example bit.ly), shown under the room code instead of the long address.
