# Demo: Guess Closer!

The finished version of the game from the workshop. Players scan a QR code, pick a nickname and guess numbers on their phones. The closest guess wins the round, and equal guesses go to the earlier answer. The projector shows the host screen.

**Play it:** https://delta-43.github.io/cooperative-coding-workshop/ . Open `#/host` on a big screen to host a room.

## What's in here

```
AGENTS.md        Short, hand-written instructions both agents read (CLAUDE.md imports it)
PLAN.md          Goal, team, design, phases and tasks. The humans own it
DECISIONS.md     One line per decision
contract/        The WebSocket messages both sides share: messages.md, schema.json, examples
backend/         The Cloudflare Worker and the room logic
frontend/        Host screen and phone screens (React, TypeScript, Vite)
docs/            DESIGN.md (the visual system) and mockup.html (the first sketch and mockup)
```

## How it works

```
Phones and laptops ──▶ GitHub Pages         static frontend (frontend/)
        │
        └── WebSocket ──▶ Cloudflare Worker ──▶ Durable Object, one per room
```

The frontend is static and is published to GitHub Pages by `.github/workflows/pages.yml`. The backend is one Cloudflare Worker with a Durable Object per room. The two sides share only the contract.

## Run it locally

```sh
cd demo/backend && npm ci && npm test        # Worker tests and contract examples
npm run dev                                   # Worker on http://localhost:8787
cd ../frontend && npm ci
VITE_BACKEND_URL=http://localhost:8787 npm run dev    # http://localhost:5173
```

Without `VITE_BACKEND_URL` the frontend uses the live Worker. The host keys are Space (main action), Backspace (back) and Esc (players).

## License

MIT, see [`LICENSE`](LICENSE).
