# AGENTS.md

Guess Closer! is a live quiz game for a room. Two people build it, each with their own agent.

Paths are relative to this folder (`demo/` in the workshop repo).

## Who owns what

- `backend/`: Delta. Cloudflare Worker, one Durable Object per room.
- `frontend/`: the Volunteer. React, TypeScript, Vite. Design layer: `frontend/src/styles/game.css`.
- `contract/`: both. Change it first, in its own PR, before any code that depends on it.

Only work inside the folder your issue owns. The issue's "Do not touch" line is a rule.

## Run and test

- Backend: `cd backend && npm ci && npm test`. Local Worker: `npm run dev`, then `node test/e2e.mjs`.
- Frontend: `cd frontend && npm ci && npm run lint && npm run build`. Dev server: `npm run dev`.
- Run the issue's verify command before you say a task is done, and paste its output into the PR.

## Rules

- One branch per issue, named after it: `b3-scoring`, `f2-answer-screen`.
- Small PRs. CI must pass. A human approves; agents only comment.
- Never read, print or commit secrets, tokens or `.env` files. Never deploy.
- A decision goes into `DECISIONS.md` as one line, in the same PR.
- British English in text the players see.
