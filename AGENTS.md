# AGENTS.md

Guess Closer! is a live quiz game for a room. Two people build it, each with their own agent.

## Who owns what

- `backend/`: Delta. Cloudflare Worker, one Durable Object per room.
- `frontend/`: the Volunteer. React, TypeScript, Vite. The look is the Volunteer's to design.
- `contract/`: both. Change it first, in its own PR, before any code that depends on it.

Only work inside the folder your issue owns. The issue's "Do not touch" line is a rule.

## Run and test

- Backend: `cd backend && npm ci && npm test`. Local Worker: `npm run dev`, then `node test/e2e.mjs`.
- Frontend: `cd frontend && npm ci && npm run lint && npm run build`. Dev server: `npm run dev`.
- Run the issue's verify command before you say a task is done, and paste its output into the PR.

## Rules

- One branch per issue, named after it: `b3-scoring`, `f2-answer-screen`.
- Small PRs. CI must pass. A human approves; agents only comment.
- Never read, print or commit secrets, tokens or `.env` files. Never deploy: Delta deploys the Worker by hand.
- The test Worker is `https://guess-closer-live.delta-43.workers.dev`. The frontend reads its address from `VITE_BACKEND_URL` and uses this one by default.
- The frontend is published to GitHub Pages at `https://delta-workshops.github.io/guess-closer/` by `.github/workflows/pages.yml` when a PR changes `frontend/` and merges. So it must work under a sub-path: in `vite.config.ts` set `base: process.env.BASE_PATH ?? '/'`; use hash routes (`#/host`, `#/join`) because Pages has no fallback for other paths; never write absolute asset paths such as `/logo.svg`. The QR code on the host screen must encode the address the host is using (`location.origin + location.pathname`), not a hard-coded one.
- A decision goes into `DECISIONS.md` as one line, in the same PR.
- British English in text the players see.
