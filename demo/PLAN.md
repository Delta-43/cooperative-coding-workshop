# PLAN.md

Both agents read this file. Only the humans change it.

## Goal

A live quiz game that a room of 30 can play from their phones. Finished means: a host opens a room on the big screen, players join with a code or QR, everyone plays ten number questions, and the final board shows the winner.

## Team

| Who | Owns | Also |
|---|---|---|
| Delta and their agent | `backend/` | Coordinator. Closes every phase sign-off |
| The Volunteer and their agent | `frontend/` | Reviews Delta's pull requests |
| Both | `contract/` | Changed first, in its own pull request |

## Design

```
Phones and laptops ──▶ GitHub Pages         static frontend (frontend/)
        │
        └── WebSocket ──▶ Cloudflare Worker ──▶ Durable Object, one per room
```

The server sends the whole game as one `state` message after every change. Clients draw the screen from the latest `state` and keep no copy of their own.

## Contract

`contract/messages.md` is the agreement, `contract/schema.json` is the machine-readable version, and `contract/examples/` holds one example of every message. CI checks the examples against the schema. A change to the contract is its own pull request, approved by both people, and merges before any code that depends on it.

## Phases

Each phase is a milestone with one "Phase N sign-off" issue. Only the coordinator closes it, after checking every "done when".

| Phase | Tasks | Done when |
|---|---|---|
| 1. Contract | C1 messages, schema and examples on a skeleton with CI | `cd backend && npm test` passes and both people approved |
| 2. Build in parallel | B1 rooms and codes · B2 join and answer intake · B3 scoring. F1 join screen · F2 answer screen · F3 host board · F4 leaderboard motion | Every task's verify command passes in CI, and each side stayed in its own folder |
| 3. Integrate | I1 point the frontend at the Worker · I2 one full game end to end | `node backend/test/e2e.mjs` passes against the Worker, and a room plays one full game |

Every task is one issue, one branch and one agent, with a "done when", an exact verify command and a "do not touch" line.

Small-change lane: a typo or copy fix needs an issue and a pull request, but no phase sign-off.

## Out of scope

- Accounts, logins and saved history. A room lasts for one game.
- More than 30 players in a room.
- Editing questions in the app. The question set is loaded when the Worker is deployed.
- Undoing a round on the server.
