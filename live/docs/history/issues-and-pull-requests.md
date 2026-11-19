# Issues and pull requests from the day
Exported on 2026-11-19 from the throwaway organisation, before it was deleted. Pull requests and issues share one numbering. The Volunteer is not named.

> Links to the stage repository, its Pages site and its Worker in this export no longer work: they were taken down after the workshop.
---

## Pull request #1: Publish the frontend to GitHub Pages

*merged, opened by Delta-43 on 2026-11-17*

Adds `.github/workflows/pages.yml`: builds `frontend/` with `BASE_PATH=/guess-closer/` and deploys it to https://delta-workshops.github.io/guess-closer/. It does nothing until `frontend/package.json` exists.

Also adds the sub-path rule (base path, hash routes, QR from the current address) to `AGENTS.md` and `prompts/frontend-start.md`, so the frontend agent sets it up in its first change.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_018LqARyTovL39bLGG1K5o8x

---

## Issue #2: C1: Messages, schema and examples

*closed, opened by Delta-43 on 2026-11-17*

Branch: `c1-contract` (already written).

## Done when
- `contract/messages.md`, `contract/schema.json` and `contract/examples/` describe every message.
- CI checks the examples against the schema.
- Both people approved the pull request.

## Verify
```sh
cd backend && npm ci && npm test
```

## Do not touch
everything outside `contract/`, the skeleton and CI. Merges before any code that depends on it.

Plan: `PLAN.md`. Read `AGENTS.md` and `contract/messages.md` first. One branch, small pull request, paste the verify output into it.

---

## Issue #3: B1: Rooms and codes

*closed, opened by Delta-43 on 2026-11-17*

Branch: `b1-rooms`.

## Done when
- `GET /api/health` answers `{ "ok": true }`.
- `POST /api/rooms` makes a 4-letter room code and a host token.
- A host and players can open a WebSocket to a room; the host gets a `state` message at once.
- Wrong host token is refused.
- Each question can carry an optional `timeLimit` (seconds, default 20) and a `fact` (`{ text, source }`). The three sample questions each have a fact that does not contain the answer.
- The `question` object in `state` has `timeLimit`, `endsAt`, `serverTime` and `fact`, as in the contract (PR #22).

## Verify
```sh
cd backend && npm ci && npm test
npm run dev   # then, in a second terminal:
node test/e2e.mjs rooms
```

## Do not touch
`frontend/`, `contract/`, `backend/test/e2e.mjs`, `backend/test/contract.test.js`

Plan: `PLAN.md`. Read `AGENTS.md` and `contract/messages.md` first (it changes in PR #22: timer and fact). One branch, small pull request, paste the verify output into it.


> **Delta-43** (2026-11-18):
>
> Done: merged to main with PR #15 (task PR #26). Verify output is in that PR.

---

## Issue #4: B2: Join and answer intake

*closed, opened by Delta-43 on 2026-11-17*

Branch: `b2-answers`. Needs B1.

## Done when
- Players join with a nickname (1 to 16 characters), rejoin with their player id, and are listed with `connected` status.
- Players send answers during a question; wrong phase and bad messages get the contract's error codes.
- The host can kick a player.
- An `answer` after `endsAt` gets the error `time_up` and changes nothing. Use `backend/src/timer.js` from B4 (#23).

## Verify
```sh
cd backend && npm ci && npm test
npm run dev   # then, in a second terminal:
node test/e2e.mjs answers
```

## Do not touch
`frontend/`, `contract/`, `backend/test/e2e.mjs`, `backend/test/contract.test.js`

Plan: `PLAN.md`. Read `AGENTS.md` and `contract/messages.md` first (it changes in PR #22: timer and fact). One branch, small pull request, paste the verify output into it.


> **Delta-43** (2026-11-18):
>
> Done: merged to main with PR #15 (task PR #27). Verify output is in that PR.

---

## Issue #5: B3: Scoring

*closed, opened by Delta-43 on 2026-11-17*

Branch: `b3-scoring`. Needs B2.

## Done when
- The host reveals a question: points by relative error (3, 2, 1), ties broken by time, ranks never shared.
- `show` releases the reveal to players; `next` moves on; the game ends with a final board.
- The unit tests for scoring were written first and pass.
- A player with no answer adds the time the question was open, never more than `timeLimit` (B4's `noAnswerTime`).
- `reveal` still works before and after `endsAt`: there is no automatic reveal.

## Verify
```sh
cd backend && npm ci && npm test
npm run dev   # then, in a second terminal:
node test/e2e.mjs all
```

## Do not touch
`frontend/`, `contract/`, `backend/test/e2e.mjs`, `backend/test/contract.test.js`

Plan: `PLAN.md`. Read `AGENTS.md` and `contract/messages.md` first. One branch, small pull request, paste the verify output into it.


> **Delta-43** (2026-11-18):
>
> Done: merged to main with PR #15 (task PR #29). Verify output is in that PR.

---

## Issue #6: F1: Join screen

*closed, opened by Delta-43 on 2026-11-17*

Branch: `f1-join-screen`.

## Done when
- A player opens the site, types the room code and a nickname, and joins.
- Errors from the contract (bad name, no room) show in plain words.
- Works with one thumb on a phone.

## Verify
```sh
cd frontend && npm ci && npm run lint && npm run build
```

## Do not touch
`backend/`, `contract/`

Plan: `PLAN.md`. Read `AGENTS.md` and `contract/messages.md` first. One branch, small pull request, paste the verify output into it.

---

## Issue #7: F2: Answer screen

*closed, opened by Delta-43 on 2026-11-17*

Branch: `f2-answer-screen`.

## Done when
- During a question a player sees the question and enters a whole number.
- After sending, the screen says the answer was sent; after the reveal it shows how close they were.
- "Answers are closed" shows when the phase has moved on.
- A countdown shows the time left. Work it out from `endsAt - serverTime` when each `state` arrives, then count down on the phone's own clock. Never compare `endsAt` with the phone's clock.
- When the time runs out the screen says time is up and stops accepting input. The server answers `time_up` to a late answer: show that in plain words.
- After sending, the screen shows the question's `fact` as a "Did you know?" card while the player waits. No card when `fact` is `null`.

## Verify
```sh
cd frontend && npm ci && npm run lint && npm run build
```

## Do not touch
`backend/`, `contract/`

Plan: `PLAN.md`. Read `AGENTS.md` and `contract/messages.md` first (it changes in PR #22: timer and fact). One branch, small pull request, paste the verify output into it.


---

## Issue #8: F3: Host board

*closed, opened by Delta-43 on 2026-11-17*

Branch: `f3-host-board`.

## Done when
- The host creates a room and sees the join code and a QR code that encodes the address the host is using.
- The big screen shows the question, who has answered, the reveal and the correct answer; the host can reveal, show and move on.
- Readable from the back of a room.
- The big screen shows a large countdown from `endsAt - serverTime` and the "Did you know?" card (`fact`, with its source) while players answer. The card never holds the answer. The host can press reveal before or after the time ends.

## Verify
```sh
cd frontend && npm ci && npm run lint && npm run build
```

## Do not touch
`backend/`, `contract/`

Plan: `PLAN.md`. Read `AGENTS.md` and `contract/messages.md` first (it changes in PR #22: timer and fact). One branch, small pull request, paste the verify output into it.


---

## Issue #9: F4: Leaderboard motion

*closed, opened by Delta-43 on 2026-11-17*

Branch: `f4-leaderboard-motion`. Needs F3.

## Done when
- The leaderboard and final board animate rank changes and the winner.
- Reduced-motion settings are respected.
- No animation blocks reading the result.

## Verify
```sh
cd frontend && npm ci && npm run lint && npm run build
```

## Do not touch
`backend/`, `contract/`

Plan: `PLAN.md`. Read `AGENTS.md` and `contract/messages.md` first. One branch, small pull request, paste the verify output into it.

---

## Issue #10: I1: Point the frontend at the Worker

*open, opened by Delta-43 on 2026-11-17*

Branch: `i1-point-at-worker`.

## Done when
- The built frontend talks to the Worker through `VITE_BACKEND_URL` (test Worker by default).
- `node backend/test/e2e.mjs all <Worker address>` passes.

## Verify
```sh
node backend/test/e2e.mjs all https://guess-closer-live.delta-43.workers.dev
```

## Do not touch
anything outside what the issue needs; ask in the pull request first.

Plan: `PLAN.md`. Read `AGENTS.md` and `contract/messages.md` first. One branch, small pull request, paste the verify output into it.

---

## Issue #11: I2: One full game end to end

*open, opened by Delta-43 on 2026-11-17*

## Done when
- A room plays one full game from the published site: open, join, ten questions, final board.
- The published address is `https://delta-workshops.github.io/guess-closer/`.

## Verify
Play it with real phones.

## Do not touch
code. Only fix what breaks, as small separate pull requests.

Plan: `PLAN.md`. Read `AGENTS.md` and `contract/messages.md` first. One branch, small pull request, paste the verify output into it.

> **Delta-43** (2026-11-18):
>
> Added by Delta's agent while reviewing F1 to F3. Before the live game, check what the PRs could not test:
> - Scan the host's QR with a real phone and join; play on two or more real phones (one-thumb use, reading the clock).
> - Read the host board from the back of the room on a projector.
> - Reduced-motion setting on a phone and on the host board.
> - A full ten-question game with many players (aim for 30) on the published site.
> - Backend: the room clears about 10 minutes after the game ends (checked locally only; see #37 and #39).

> **Delta-43** (2026-11-18):
>
> Played one round on the published site with a host tab and a phone-sized player: open a room from the QR-style address (?room=CODE), join, start, answer, reveal, show. It worked, apart from the host reveal layout bug in #44. Not yet played: the leaderboard step, the final board, a real phone, and a game with several players.

---

## Issue #12: Phase 1 sign-off: Contract

*open, opened by Delta-43 on 2026-11-17*

Only the coordinator closes this, after checking every item.

## Done when
C1 merged, `cd backend && npm test` passes, both people approved.

---

## Issue #13: Phase 2 sign-off: Build in parallel

*open, opened by Delta-43 on 2026-11-17*

Only the coordinator closes this, after checking every item.

## Done when
B1 to B3 and F1 to F4 merged, every verify command passes in CI, and each side stayed in its own folder.

---

## Issue #14: Phase 3 sign-off: Integrate

*open, opened by Delta-43 on 2026-11-17*

Only the coordinator closes this, after checking every item.

## Done when
`node backend/test/e2e.mjs` passes against the Worker and a room played one full game.

---

## Pull request #15: C1: Contract, messages, schema and the acceptance test

*merged, opened by Delta-43 on 2026-11-17*

Closes #2.

The agreement between backend and frontend: `contract/messages.md`, `contract/schema.json`, one example of every message, and the acceptance test (`backend/test/e2e.mjs`, `backend/test/contract.test.js`). CI checks the examples against the schema.

Needs approval from both people before it merges. Backend and frontend code come after it.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_018LqARyTovL39bLGG1K5o8x

---

## Issue #16: Small change: join route and show in the agent notes

*closed, opened by Delta-43 on 2026-11-17*

Small-change lane, no phase sign-off.

`AGENTS.md` says `#/join`, but the QR code encodes the plain address, so the plain address must be the join screen. The frontend starting prompt should say that the host sends `reveal` and then `show`.

## Done when
`AGENTS.md` and `prompts/frontend-start.md` agree with the contract.

## Do not touch
`contract/`, `backend/`, `frontend/`

---

## Pull request #17: Agent notes: the plain address is the join screen; the host sends show

*merged, opened by Delta-43 on 2026-11-17*

Closes #16.

- `AGENTS.md`: `#/host` is the big screen and the plain address is the join screen (it said `#/join`, which disagrees with the QR rule and the frontend prompt).
- `prompts/frontend-start.md`: the host sends `reveal` and then `show`; the F issues are linked; start after PR 15 merges.

No code changes.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_018LqARvE4bTGreeYSUbpVtw

---

## Issue #18: Small change: skill links in the frontend prompt

*closed, opened by Delta-43 on 2026-11-17*

Small-change lane, no phase sign-off.

The frontend starting prompt should list the skills for each moment (Impeccable, better-ui, improve-animations, apple-design) with their repo links, a pinned install command and a report-only prompt, so they can be collected during the build.

## Done when
`prompts/frontend-start.md` has the four skills, each with a link, an install command and a prompt.

## Do not touch
`contract/`, `backend/`, `frontend/`

---

## Pull request #19: Frontend prompt: skill links, pinned installs and a prompt each

*merged, opened by Delta-43 on 2026-11-17*

Closes #18.

`prompts/frontend-start.md` gets a "Collect the skills" section:

- The four frontend skills from slide 26, each with its repo link and license: Impeccable (Apache-2.0), better-ui, improve-animations and apple-design (MIT).
- Install commands for the human to run, not the agent. They are user-level (`-g`), so nothing lands in the repo, and pinned to a commit or version from 2026-11-17.
- One report-only prompt per moment: the human chooses what to fix.

Flags checked against the `skills` CLI reference (`-g`, `-a`, `--skill`, `owner/repo@commit`) and Impeccable's README (`--providers`, `--scope`). The installs were not run here: Claude Code's auto mode blocked running a third-party installer, which is the point of the advice to run them yourself.

No code changes.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_018LqARvE4bTGreeYSUbpVtw

---

## Issue #20: Small change: backend prompts in prompts/

*closed, opened by Delta-43 on 2026-11-17*

Small-change lane, no phase sign-off.

Put Delta's backend prompts in `prompts/` next to the frontend prompt, so both people's prompts are in the repo.

## Done when
`prompts/backend-prompts.md` exists and the README lists both prompt files.

## Do not touch
`contract/`, `backend/`, `frontend/`

---

## Pull request #21: Backend prompts in prompts/, next to the frontend prompt

*merged, opened by Delta-43 on 2026-11-17*

Closes #20.

- `prompts/backend-prompts.md`: Delta's prompts for B1 to B3, the session start, the two backend skills (API Contract Review, Clean Code) with links, pinned installs and report-only prompts, and the deploy step after B3.
- README: `prompts/` lists both files.

Where the private copy says where the fallback checkpoints are kept, this copy only says that a prepared checkpoint exists. The research advises keeping checkpoints off the public repo, so neither the agents nor the room can read the answers.

No code changes.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_018LqARvE4bTGreeYSUbpVtw

---

## Pull request #22: C2: Contract adds the answer timer and the Did you know? fact

*merged, opened by Delta-43 on 2026-11-18*

Adds the answer timer and the "Did you know?" card to the contract. Stacked on #15 (`c1-contract`): retarget to `main` once #15 merges.

## What changes
- `state.question` gains `timeLimit` (seconds, 5 to 120, default 20), `endsAt`, `serverTime` (both server-clock milliseconds) and `fact` (`{ text, source }` or `null`).
- New error code `time_up`: an `answer` after `endsAt` changes nothing.
- The timer is kept by the server. There is no automatic reveal: the host still sends `reveal`. A question with no answer adds at most `timeLimit` to a player's total time.
- A fact is sent with the question, so **it never contains the answer**. Players see it while they wait.
- `e2e.mjs` checks the timer fields and the `time_up` reply. Examples and `DECISIONS.md` updated.

## Decide before approving
- Time left is `endsAt - serverTime`, counted down on the phone's own clock. Is a server-kept clock with no auto-reveal what we want?
- Is 20 seconds the right default?

## Facts (sample questions; the real ten come from the `QUESTIONS` secret)
- Piano: Bösendorfer's Imperial grand has extra bass keys with black tops ([Wikipedia: Bösendorfer](https://en.wikipedia.org/wiki/B%C3%B6sendorfer)). Written without the number 88.
- Bones: babies have more bones than adults; sources say about 270 to 300, so wording stays loose ([Wikipedia: Human skeleton](https://en.wikipedia.org/wiki/Human_skeleton)).
- Minutes in a week: the seven-day week may come from Babylon (evidence weak), was first practised in Judaism by the 6th century BC, and Constantine decreed it for Rome in AD 321 ([Wikipedia: Week](https://en.wikipedia.org/wiki/Week)).

## Verify
`cd backend && npm ci && npm test`: 13 pass. `e2e.mjs` is syntax-checked only; it needs a Worker that does not exist yet.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_018LqARwHaCYV2DrfMSUvGE5


---

## Issue #23: B4: Answer timer

*closed, opened by Delta-43 on 2026-11-18*

Branch: `b4-timer`. Needs the contract change in PR #22.

## Done when
- `backend/src/timer.js` holds the timer rules as pure functions, with no Worker or Durable Object code: the question's time limit (default 20 s, 5 to 120), `endsAt` from the opening time, whether an answer is still accepted, the time left, and a no-answer time that never goes over the limit.
- The unit tests were written first and pass.
- B2 and B3 call this module. It does not change `room.js`.

## Verify
```sh
cd backend && npm ci && npm test
```

## Do not touch
`frontend/`, `contract/`, `backend/test/e2e.mjs`, `backend/test/contract.test.js`

Plan: `PLAN.md`. Read `AGENTS.md` and `contract/messages.md` ("The timer") first. One branch, small pull request, paste the verify output into it.


> **Delta-43** (2026-11-18):
>
> Done: merged to main with PR #15 (task PR #24). Verify output is in that PR.

---

## Pull request #24: B4: Answer timer helpers

*merged, opened by Delta-43 on 2026-11-18*

Closes #23.

The timer rules as pure functions in `backend/src/timer.js`: the time limit of a question (default 20 s, 5 to 120), `endsAt`, whether an answer is still accepted, time left, and the answer and no-answer times (never over the limit). It does not touch `room.js`, which B2 and B3 will write. Tests written first.

Stacked on #22 (the contract change). Retarget to `main` once #22 and #15 have merged.

## Verify
`cd backend && npm ci && npm test`
```
ℹ tests 25
ℹ pass 25
ℹ fail 0
```
(13 contract tests and 12 timer tests.)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_018LqARwHaCYV2DrfMSUvGE5


---

## Pull request #25: B1: Rooms and codes

*merged, opened by Delta-43 on 2026-11-18*

Closes #3.

Worker routes, room codes, the room Durable Object, and the sample questions with their facts and timer.

Stacked on `b4-timer`: retarget to `main` when that merges.

## Verify
`cd backend && npm ci && npm test`: 25 pass
`npm run dev`, then `node test/e2e.mjs rooms`: `e2e ok (rooms)`

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_018LqARwHaCYV2DrfMSUvGE5


---

## Pull request #26: B2: Join and answer intake

*merged, opened by Delta-43 on 2026-11-18*

Closes #4.

Join, rejoin, answer, start and kick, with the error codes and the answer timer (`time_up`) from B4.

Stacked on `b1-rooms`: retarget to `main` when that merges.

## Verify
`cd backend && npm ci && npm test`: 25 pass
`npm run dev`, then `node test/e2e.mjs answers`: `e2e ok (answers)`

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_018LqARwHaCYV2DrfMSUvGE5


---

## Pull request #27: B3: Scoring

*merged, opened by Delta-43 on 2026-11-18*

Closes #5.

Scoring rules (tests first), reveal, show and next, and the final order. Players see no result until the host sends `show`. The `all` run includes the `time_up` check, so it takes about 20 seconds.

Stacked on `b2-answers`: retarget to `main` when that merges.

## Verify
`cd backend && npm ci && npm test`: 32 pass
`npm run dev`, then `node test/e2e.mjs all`: `e2e ok (all)`

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_018LqARwHaCYV2DrfMSUvGE5


---

## Issue #28: B5: Shuffle questions, clear finished rooms

*closed, opened by Delta-43 on 2026-11-18*

Branch: `b5-shuffle-clear`. Needs B3.

## Done when
- Every new room gets the questions in a fresh random order.
- When a game ends (`over`), the room clears itself after a grace period (default 10 minutes, so phones can still read the final board): sockets closed, stored state deleted, nothing kept.
- Unit tests for the shuffle pass.

## Verify
```sh
cd backend && npm ci && npm test
npm run dev   # then, in a second terminal:
node test/e2e.mjs all
```

## Do not touch
`frontend/`, `contract/`, `backend/test/e2e.mjs`, `backend/test/contract.test.js`


> **Delta-43** (2026-11-18):
>
> Done: merged to main with PR #15 (task PR #29). Verify output is in that PR.

---

## Pull request #29: B5: Shuffle questions, clear finished rooms

*merged, opened by Delta-43 on 2026-11-18*

Closes #28.

- Each new room gets the questions in a fresh random order (`src/shuffle.js`, with tests).
- When the game reaches `over`, an alarm clears the room after `CLEAR_AFTER_MS` (default 10 minutes, so phones can still read the final board): sockets closed, stored state deleted. The room code can be used again.

Stacked on `b3-scoring` (#27): retarget to `main` when that merges.

## Verify
`cd backend && npm ci && npm test`: 35 pass.
Local Worker with `CLEAR_AFTER_MS=3000`: four rooms gave four different question orders; after the game ended, a new connection was open before and refused 3.5 s later, and the host socket was closed.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_018LqARwHaCYV2DrfMSUvGE5


---

## Pull request #30: C3: Contract adds question.number and the trivia endpoint

*merged, opened by Delta-43 on 2026-11-18*

Contract change, no backend code. The room shuffles questions (#29), so a card cannot be tied to a place in the game. Each question now has a fixed `number` (its place in the question set), and a card is fetched by that number.

- `state.question.number` (integer, 1 or more). `index` stays the place in this game.
- `GET /api/trivia/<number>` returns `{ number, text, source }`, or `404 { "error": "no_card" }`. The card text is also in `question.fact` of the `state` message.
- Examples, `e2e.mjs` check and `DECISIONS.md` updated.

Stacked on `b5-shuffle-clear` (#29): retarget to `main` when that merges. Needs approval from both people.

## Verify
`cd backend && npm ci && npm test`: 35 pass.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_018LqARwHaCYV2DrfMSUvGE5


---

## Issue #31: B6: Trivia cards by question number

*closed, opened by Delta-43 on 2026-11-18*

Branch: `b6-trivia`. Needs the contract change in #30.

## Done when
- `backend/TRIVIA.md` holds a researched, spoiler-free "Did you know?" card for each of the ten live questions, linked by question number, with sources. It has no question text or answers.
- `backend/src/trivia.json` holds the cards by number. The Worker adds them to the questions of the `QUESTIONS` secret, and `question.number` stays fixed when the room shuffles.
- `GET /api/trivia/<number>` returns a card as JSON, or `404 no_card`.
- The unit tests pass.

## Verify
```sh
cd backend && npm ci && npm test
npm run dev   # then, in a second terminal:
node test/e2e.mjs all
```

## Do not touch
`frontend/`, `contract/`, `backend/test/e2e.mjs`, `backend/test/contract.test.js`


> **Delta-43** (2026-11-18):
>
> Done: merged to main with PR #15 (task PR #32). Verify output is in that PR.

---

## Pull request #32: B6: Trivia cards by question number

*merged, opened by Delta-43 on 2026-11-18*

Closes #31.

- `backend/TRIVIA.md`: one researched card per live question, by question number, with source and what was checked. No question text or answers, because those stay in the `QUESTIONS` secret.
- `backend/src/trivia.json`: the cards, keyed by number. A room joins them to the `QUESTIONS` questions before it shuffles, so each card follows its question. A question with its own `fact` keeps it (the sample set does).
- `question.number` in every `state`, and `GET /api/trivia/<number>`.

Stacked on `c3-question-number` (#30): retarget to `main` when that merges.

## Verify
`cd backend && npm ci && npm test`: 42 pass.
Local Worker with ten dummy questions: two shuffled games (orders 6,8,5,4,7,9,10,1,3,2 and 2,10,7,1,6,5,8,3,9,4), and every question carried its own card; `GET /api/trivia/11` gave `404 no_card`. `node test/e2e.mjs all` on the sample set: `e2e ok (all)`.

The cards were checked against the sources, but read each against its real answer before deploying: the tests cannot see the answers.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_018LqARwHaCYV2DrfMSUvGE5


---

## Pull request #33: F1: Join screen, on a new React frontend

*merged, opened by the Volunteer on 2026-11-18*

Closes #6

Rebuilds `frontend/` from source (React, TypeScript, Vite), replacing the old committed build, and adds the join screen.

## What's in it
- **Pages-ready:** `base: process.env.BASE_PATH ?? '/'`, hash routes (`#/host` is a placeholder until F3, the plain address joins), no absolute asset paths, backend from `VITE_BACKEND_URL` with the test Worker as default.
- **Join:** room code plus nickname. `?room=ABCD` in the address fills the code in for a QR scan (the QR still encodes `location.origin + location.pathname`).
- **Errors in plain words:** room not found, `name_taken`, `bad_name`, `room_full`, removed by the host (close code 4000). The form keeps what was typed.
- **Lobby card** after joining. Reconnects after a drop and joins again with the saved `playerId`.
- **Look:** warm paper canvas, Lora and Figtree, squircle cards, the duck illustrations (moved to `frontend/public/ducks/`), and water drawn on a canvas.
- Two lines in `DECISIONS.md`.

## Depends on
The contract PR (#15) must merge first. Types in `src/contract.ts` follow it, with the timer and fact fields from #22 marked optional.

## Tested
Against the test Worker: a code that doesn't exist shows "couldn't find room", joining a real room reaches the lobby, and joining again with the same name in capitals shows "Someone already has that name".

## Verify
```
$ cd frontend && npm ci && npm run lint && npm run build
> eslint .
dist/index.html                   0.86 kB │ gzip:  0.44 kB
dist/assets/index-DnmxshB-.css    5.96 kB │ gzip:  2.30 kB
dist/assets/index-DGeDMK0i.js   228.77 kB │ gzip: 72.11 kB
✓ built in 313ms
```

🤖 Generated with [Claude Code](https://claude.com/claude-code)


---

## Pull request #34: F2: Answer screen with rolodex cards, flip clock and water

*merged, opened by the Volunteer on 2026-11-18*

Closes #7

Stacked on F1 (`f1-join-screen`), so this diff shows only F2. Merge F1 first. After that, GitHub retargets this PR to `main`.

## What's in it
- **Rolodex cards:** the current question card sits in the middle, used cards fade off to the left with their text, and blank cards wait on the right. When the question moves on, the bird leaves first and then the stack slides one place left with a calm overshoot.
- **Birds:** one per card, seeded by the question number so every phone shows the same bird. It flies in, perches and bobs, then flies off forwards in the direction it faces.
- **Flip clock** in the top right, red for the last 10 seconds. Time left is `endsAt - serverTime` when each `state` arrives, counted on `performance.now()`. It never compares `endsAt` with the phone's clock.
- **Answer:** a whole number with thousands separators. Covers sent, change answer, time's up, `time_up` ("arrived too late") and answers closed. Nothing about the result shows before `show`.
- **"Did you know?"** card after answering, rotating every 20 seconds. ⚠️ When `fact` is `null`, it shows general "Pond fact" cards instead of nothing. The issue asks for no card, so this is a deliberate change, recorded in `DECISIONS.md`.
- **Water progress tube** along the bottom. After `show`, the result: the answer, your guess, how far off, rank and points, with a beaker that pours for 5 s, settles for 3 s and stays.
- **Final placing** with the top three.

## Tested
A full 10-question game on the test Worker, with a scripted host and a second player: join, start, time running out, reveal hidden before `show`, result after `show`, answering, changing an answer, the beaker filling to ~94% for a 6.3%-off guess, rolodex and bird transitions, and the final board. Bugs found and fixed along the way: the card overflowing, the tube collapsing, a stale clock reading for a moment when a new question arrived, and the beaker stalling on slow frames.

Not tested: a real phone (only the browser's phone size), and the reduced-motion setting.

## Verify
```
$ cd frontend && npm ci && npm run lint && npm run build
> eslint .
dist/index.html                   0.86 kB │ gzip:  0.45 kB
dist/assets/index-BB049opE.css   14.24 kB │ gzip:  4.32 kB
dist/assets/index-AOrIzPGB.js   239.84 kB │ gzip: 75.55 kB
✓ built in 78ms
```

🤖 Generated with [Claude Code](https://claude.com/claude-code)


---

## Pull request #35: F3: Host board with QR lobby, live answers, reveal and final board

*merged, opened by the Volunteer on 2026-11-18*

Closes #8

Stacked on F2 (`f2-answer-screen`, #34), which is stacked on F1 (#33), so this diff shows only F3. Merge in order: F1, F2, F3.

## What's in it
- **Open a room** from `#/host` (`POST /api/rooms`). The room is kept in `sessionStorage`, so a refresh of the big screen rejoins it.
- **Lobby:** a QR code for the address the host is using (`location.origin + location.pathname`) plus `?room=CODE`, which fills the code in on the phone. Also the address in text, the code in four large tiles, player chips with remove (`kick`), and "N players in of 30". Start stays disabled until someone joins.
- **Question:** the rolodex card in large type with its bird, the flip-clock countdown from `endsAt - serverTime` (red under 10 s, "Time's up" at 0), "N of M answered" with chips that fill in as players answer (never the values), the "Did you know?" `fact` with its source, and the water progress tube. The host can reveal before or after the time ends.
- **Reveal:** `reveal` shows "Answers are closed", then `show` counts the answer up and slides in the top 8 guesses by rank, with how far off each was and their points, plus how many didn't answer.
- **Final board:** the winner, then everyone in final order with points and total answer time, and "Open a new room".
- **Controls:** one main button per screen, also on Space, Enter or the right arrow, so a presentation clicker works.
- Sized in `vw` to read from the back of a room. Adds the `qrcode` package. Two lines in `DECISIONS.md` (the QR address, the host controls).

## Tested
A full 10-question game on the test Worker from `#/host` with three bot players: lobby, remove a player, start from the keyboard, live answered chips, time running out, reveal hidden before `show`, count-up and ranked results, refresh mid-game rejoining the room, and the final board. Fixed along the way: the bird overlapping the heading (phone too), the fact card under the button, and the key handler crashing on a non-element target.

Not tested: a real projector, scanning the QR with a phone, and the reduced-motion setting.

## Verify
```
$ cd frontend && npm ci && npm run lint && npm run build
> eslint .
dist/index.html                   0.86 kB │ gzip:  0.45 kB
dist/assets/index-Ckt-n4DA.css   21.92 kB │ gzip:  5.95 kB
dist/assets/index-b7tdKN-f.js   274.24 kB │ gzip: 87.35 kB
✓ built in 332ms
```

🤖 Generated with [Claude Code](https://claude.com/claude-code)


---

## Pull request #36: F4: Leaderboard motion with the results glass and rolling arrow

*merged, opened by the Volunteer on 2026-11-18*

Closes #9

Stacked on F3 (`f3-host-board`, #35), so this diff shows only F4. Merge in order: F1 #33, F2 #34, F3 #35, then this.

## What's in it
- **Results glass** beside the reveal on the big screen. Water pours up to the closest guess for 5 s with splashing and bubbles, jitters for 3 s, then calms and stays. Each name sits at the height of that player's guess. A blue arrow rolls up the side (one full turn per step) from the furthest guess to the winner, outlining each row in the results list as it passes.
- **Leaderboard step** after `show`: Show → Leaderboard → Next. Rows start in the old order (scores without this round), then slide to the new order while scores count up. ▲/▼ show rank changes, next to the round's +points. No ▲/▼ after round 1, when everyone started on 0. This step is frontend-only: the server stays in `reveal` until Next. One line in `DECISIONS.md`.
- **Final board:** places appear from last up to 2nd, then the winner lands with pastel bubbles, all within about 2.5 s. Places flow into columns, so 30 players fit on one screen.
- **Wording:** far misses read "325× too low" / "75× too high" instead of "100% off" (phone too).
- **Fits the screen:** sizes scale with screen height too, the reveal lists the top 6 plus "and N more", and the question steps back once the answer is shown, so the host never scrolls.
- **Reduced motion:** CSS animations end at once (global rule), and the count-ups, arrow and leaderboard jump to their end state.
- **No animation blocks reading:** the answer and rows are readable as they land. Every sequence finishes within a few seconds.

## Tested
A full 10-question game on the test Worker with 8 bot players: glass pour and arrow, leaderboard reorder (checked each row's old and new place, the ▲/▼ values and the counted scores), the final order with tiebreaks (equal points go to the lower total time), and the button staying clear of the progress tube. Fixed along the way: tags overlapping in the glass when everyone was far off, "100% off" for every far miss, names cut off in the results list, and the 8-player reveal pushing the button under the tube.

Not tested: reduced motion in a browser (I couldn't switch it on in the test browser), and a real projector.

## Verify
```
$ cd frontend && npm ci && npm run lint && npm run build
> eslint .
dist/index.html                   0.86 kB │ gzip:  0.45 kB
dist/assets/index-Dq3HZ_l6.css   26.69 kB │ gzip:  6.93 kB
dist/assets/index-BooYuxtI.js   278.90 kB │ gzip: 88.86 kB
✓ built in 330ms
```

🤖 Generated with [Claude Code](https://claude.com/claude-code)


---

## Issue #37: C4: Document how a finished room closes

*closed, opened by Delta-43 on 2026-11-18*

Branch: `c4-room-closing`. Found while reviewing F1 to F3.

The backend clears a finished room 10 minutes after `over` and closes every socket with code `1000` and reason `game over`; the host's `kick` closes with `4000` and reason `removed`. Only `4000` is in the contract. The frontend cannot know the room is gone, so phones keep retrying (see F6).

## Done when
- `contract/messages.md` has a "Closing" section: close code `4000` removed, close code `1000` game over (the room clears about 10 minutes after `over`, the last `state` stays valid to read), and what `/api/rooms/<CODE>/ws` answers for a cleared room.
- A line in `DECISIONS.md`.
- Both people approved.

## Verify
```sh
cd backend && npm ci && npm test
```

## Do not touch
`frontend/`, backend code. Merges before F6.

Plan: `PLAN.md`. Read `AGENTS.md` and `contract/messages.md` first. One branch, small pull request, paste the verify output into it.

---

## Issue #38: F5: Catch up with the contract types

*closed, opened by Delta-43 on 2026-11-18*

Branch: `f5-contract-types`. Found while reviewing F1 to F3.

`frontend/src/contract.ts` was written before the contract merged. The contract now has `question.number` (missing), and `timeLimit`, `endsAt`, `serverTime` and `fact` are always present (typed optional).

## Done when
- `contract.ts` matches `contract/messages.md` and `contract/schema.json`: `number` added; the timer fields and `fact` required; the comment about PR 22 removed.
- Code that guarded the optional fields still works, and the unused guards are removed.
- The `fact` fallback: decide with Delta whether "Pond fact" cards stay when `fact` is `null` (F2 said no card). Record it in `DECISIONS.md`.

## Verify
```sh
cd frontend && npm ci && npm run lint && npm run build
```

## Do not touch
`backend/`, `contract/`

Plan: `PLAN.md`. Read `AGENTS.md` and `contract/messages.md` first. One branch, small pull request, paste the verify output into it.

---

## Issue #39: F6: Stop reconnecting when the game is over

*closed, opened by Delta-43 on 2026-11-18*

Branch: `f6-room-closed`. Needs C4 (#37). Found while reviewing F1 to F3.

`useRoom.ts` only handles close code `4000`. When the backend clears a finished room it closes sockets with `1000` ("game over"); the hook then retries every 8 seconds for ever and the phone shows "reconnecting".

## Done when
- Close code `1000` stops the retries. The player and host screens keep showing the last final board, with no reconnecting banner.
- A reload after the room has cleared shows "This game has finished" with a way to join another room, not a reconnecting spinner.
- Same for the host: "Open a new room" still works.

## Verify
```sh
cd frontend && npm ci && npm run lint && npm run build
```
Then play a game on a Worker started with `CLEAR_AFTER_MS=3000` (`npx wrangler dev --var CLEAR_AFTER_MS:3000`) and watch both screens after the game ends.

## Do not touch
`backend/`, `contract/`

Plan: `PLAN.md`. Read `AGENTS.md` and `contract/messages.md` first. One branch, small pull request, paste the verify output into it.

---

## Issue #40: T1: Catch frontend drift from the contract in CI

*closed, opened by Delta-43 on 2026-11-18*

Branch: `t1-contract-check`. Needs F5 (#38).

CI only lints and builds the frontend, so nothing noticed that `contract.ts` had fallen behind the contract (F5).

## Done when
- A small test in `frontend/` reads every `contract/examples/state-*.json` and checks it against the types the frontend uses (for example by building typed fixtures from them so `tsc` fails when a field is missing or renamed).
- It runs in CI with the existing frontend job. Failing on a deliberate rename proves it works; paste that output.

## Verify
```sh
cd frontend && npm ci && npm run lint && npm run build && npm test
```

## Do not touch
`backend/`, `contract/`

Plan: `PLAN.md`. Read `AGENTS.md` and `contract/messages.md` first. One branch, small pull request, paste the verify output into it.

---

## Issue #41: Small change: backend prompts for the timer, facts, shuffle and clearing

*closed, opened by Delta-43 on 2026-11-18*

`prompts/backend-prompts.md` still rebuilds the old backend. It does not mention the answer timer (`timer.js`, `time_up`), `question.number`, trivia cards (`trivia.js`, `GET /api/trivia/<number>`), the shuffle, or clearing a finished room, so a fresh agent following it would fail the current e2e test. Update the prompts for B1 to B3 and add B4 to B6, tested the same way as before (a fresh agent, in a scratch branch). Small-change lane: no phase sign-off.

---

## Pull request #42: Realistic water and Alban's birds on the cards

*merged, opened by the Volunteer on 2026-11-18*

Stacked on F4 (`f4-leaderboard-motion`, #36), so this diff shows only this work. Merge #36 first; GitHub then points this PR at `main`.

There is no issue for this yet. It is design polish across F1 to F4 (water and birds). @Delta-43, please open one, or tell me which issue to close with it.

## Water
Every place water appears: the pond, the progress tube, the phone beaker and the results glass.
- **Waves:** sharp crests with broad troughs. Colour deepens from turquoise at the surface to dark blue, with a bright band under the surface and a crisp meniscus line.
- **Light:** caustics move under the surface (an iterated wave field, worked out at ⅓ size and stretched), and glints twinkle on the crests.
- **Splashes:** rough water throws droplets that arc back down under gravity.
- **Pouring:** a stream pours into the beaker and the results glass while they fill, splashing where it lands.
- **Bubbles:** they speed up as they rise, catch the light and pop at the surface.
- Reduced motion: the water holds still, with no droplets, bubbles or stream.

## Birds
- Alban's Peking duck, bath duck, puffin, goose and flying teal, cut out of their videos into 36-frame sprite sheets with transparency in `frontend/public/birds/` (230–400 KB each, about 1.6 MB for all five; a screen loads only the bird on its current card).
- **The cut-out:** the drawings use the same pure black as the video background (the puffin's plumage, the ink lines), so instead of keying out black, each bird's silhouette is traced (non-black, gaps closed, enclosed holes filled). The edge is redrawn as an ink line with a white sticker border, like the existing ducks.
- **Playback:** CSS `steps()` on two nested elements (columns and rows), so it runs on the compositor.
- **On the card:** one bird per card, seeded by the question so every screen shows the same one. It flies in from behind, perches (the teal hovers), and leaves forwards the way it faces when the card is about to move. Mirroring is chosen so the bird always faces its exit.
- One line in `DECISIONS.md`. Still to come from Alban: the muscovy duck.

## Tested
A bot game on the test Worker from `#/host`: the birds land, loop, leave forwards and are mirrored correctly (checked for each species that appeared: Peking duck, bath duck, puffin, goose, teal), the stream pours into the results glass with caustics and the arrow climbing, and the pond up close.

Not tested: a real phone, a real projector, and the reduced-motion setting.

## Verify
```
$ cd frontend && npm ci && npm run lint && npm run build
> eslint .
dist/assets/index-DcVdRf2D.css   27.42 kB │ gzip:  7.08 kB
dist/assets/index-71bfndI7.js   282.78 kB │ gzip: 90.29 kB
✓ built in 111ms
```

🤖 Generated with [Claude Code](https://claude.com/claude-code)



Closes #43.


---

## Issue #43: F7: Water and bird polish

*closed, opened by Delta-43 on 2026-11-18*

Branch: `birds-and-water` (already written, PR #42). Needs F4.

## Done when
- Water looks real everywhere it appears (pond, progress tube, beaker, results glass), and holds still under reduced motion.
- Alban's five birds play as sprite sheets on the cards, from `frontend/public/birds/`, with relative paths so they work under the Pages sub-path.
- Lint and build pass.

## Verify
```sh
cd frontend && npm ci && npm run lint && npm run build
```

## Do not touch
`backend/`, `contract/`

---

## Issue #44: F8: Host reveal card is cropped and the button is overlapped on a 1920x999 screen

*closed, opened by Delta-43 on 2026-11-18*

Found by playing the published site (delta-workshops.github.io/guess-closer) in Chrome, one host tab and one phone-sized player. Not seen by the Volunteer's tests.

## What happens
On `#/host`, after the host presses *Show the answer*, at a 1920x999 window (device pixel ratio 1):
- The reveal card is cut off on the left: the heading reads "erage, how far is the" and the answer "384,400" loses its first digit, so the host cannot read the answer from the back of the room.
- The main button ("Leaderboard") sits under the water progress tube and its label ("1 of 10 questions done") is drawn over the button text.
- The question step looked right at the same size; the reveal step is the one that breaks.
- The player screen after `show` was correct (answer 384,400, 4.1% off, 1st, +3 points).

## Done when
- At 1920x999, 1366x768 and 1280x720 the whole reveal card is visible and nothing overlaps the main button, in the question, reveal, leaderboard and final steps.
- The answer can be read in full at each size. Paste a screenshot of each size in the pull request.

## Verify
```sh
cd frontend && npm ci && npm run lint && npm run build
```
Then open `#/host`, play one question to *Show the answer* and check the three sizes.

## Do not touch
`backend/`, `contract/`

Plan: `PLAN.md`. Read `AGENTS.md` and `contract/messages.md` first. One branch, small pull request, paste the verify output into it.

---

## Issue #45: B7: Clear rooms that are abandoned before the game ends

*closed, opened by Delta-43 on 2026-11-18*

Found while auditing the backend. B5 clears a room 10 minutes after `over`. A room that is opened and never finished (the host closes the tab in the lobby, or mid-game) has no alarm, so its stored state stays for ever. Every test game and every real game that stops early leaves a room behind.

## Done when
- Every room gets an inactivity alarm, reset by each accepted message and each connection. After 2 hours with no activity (a setting, `IDLE_CLEAR_MS`) the room closes its sockets with close code `1000` and reason `idle`, and deletes its state.
- The `over` alarm from B5 still works and is not postponed by the idle alarm.
- Unit tests for the alarm choice (idle against game over); the choice is a pure function.
- The code is documented in the contract's closing section (C4, #37).

## Verify
```sh
cd backend && npm ci && npm test
npx wrangler dev --var IDLE_CLEAR_MS:3000   # then, in a second terminal:
node test/e2e.mjs all
```
Then open a room, do nothing for 3 seconds and check the room is refused.

## Do not touch
`frontend/`, `contract/`, `backend/test/e2e.mjs`, `backend/test/contract.test.js`

Plan: `PLAN.md`. Read `AGENTS.md` and `contract/messages.md` first. One branch, small pull request, paste the verify output into it.

> **Delta-43** (2026-11-18):
>
> Done: merged to main with PR #46 (task PR #47). Verify output is in #47.

---

## Pull request #46: C4: Contract documents how a room closes

*merged, opened by Delta-43 on 2026-11-18*

Closes #37.

Adds a "Closing" section to `contract/messages.md`: close codes `4000` (removed), `1000` "game over" (10 minutes after `over`) and `1000` "idle" (2 hours without activity), that a client must not reconnect after 1000 or 4000, what a cleared room answers (`404 no_room`), and that its code can be reused. The idle clear is built in B7 (#45), which stacks on this.

No schema change, so the examples are unchanged. Needs approval from both people. F6 (#39) builds on this.

## Verify
`cd backend && npm ci && npm test`: 42 pass.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_018LqARwHaCYV2DrfMSUvGE5


---

## Pull request #47: B7: Clear rooms that are abandoned before the game ends

*merged, opened by Delta-43 on 2026-11-18*

Closes #45.

Every room now clears itself, not only a finished one. `src/clearing.js` (pure, with tests) decides when and why:
- Not finished: 2 hours after the last activity (`IDLE_CLEAR_MS`). A joined player, an accepted message or a new connection counts as activity. A rejected message or a connection with the wrong host token does not.
- Finished: 10 minutes after `over` (`CLEAR_AFTER_MS`). Nothing postpones this.
- If the alarm fires after newer activity, the room sets a new alarm instead of clearing.
- Sockets close with code `1000` and reason `idle` or `game over`, as in the contract's "Closing" section (C4, #46).

Stacked on `c4-room-closing` (#46): retarget to `main` when that merges.

## Verify
`cd backend && npm ci && npm test`: 48 pass (6 new).
Local Worker with `IDLE_CLEAR_MS=3000` and `CLEAR_AFTER_MS=6000`:
- an untouched room: refused after 4 s.
- a room that only gets rejected messages: still cleared (they are not activity).
- a finished room with a connection every second: cleared 6 s after `over`, close `1000 game over`.

`node test/e2e.mjs all`: `e2e ok (all)`. The schema audit of a full game: 0 invalid messages.

Note: an idle room refuses joins at once, but the host's socket finishes closing about 10 s later, when the runtime evicts the idle object. The close is clean, with code 1000 and the right reason.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_018LqARwHaCYV2DrfMSUvGE5


---

## Pull request #48: Small change: backend prompts for the timer, facts, shuffle and clearing

*merged, opened by Delta-43 on 2026-11-18*

Closes #41. Small-change lane: no phase sign-off.

`prompts/backend-prompts.md` now matches the finished backend:
- B1 to B3 include the question fields (`number`, `timeLimit`, `endsAt`, `serverTime`, `fact`), `time_up`, the timer module and the no-answer time cap.
- New prompts for B4 (timer, to run before B2), B5 (shuffle and clear a finished room), B6 (trivia cards by number) and B7 (clear abandoned rooms).
- The research data (`trivia.json`, `TRIVIA.md`) is copied from the repository, not rewritten by an agent.

**Not yet tested:** a fresh agent has not run the new prompts in a scratch branch. The file says so at the top. The code the prompts describe passes `npm test` (48 tests) and `e2e.mjs all`.

Docs only: `prompts/`. The B7 prompt follows the contract's "Closing" section in #46.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_018LqARwHaCYV2DrfMSUvGE5


---

## Pull request #49: Small change: handoff notes

*merged, opened by Delta-43 on 2026-11-18*

Adds `HANDOFF.md` in the repo root: state, open work, where F8 stopped, and what to know to continue. Docs only. Delete the file when the work in it is finished.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_018LqARwHaCYV2DrfMSUvGE5

---

## Pull request #50: Birds play their real animations

*merged, opened by Delta-43 on 2026-11-18*

The Volunteer's last commit from the workshop (`4419f0b`), pushed to `birds-and-water` after #42 had already merged that branch, so it never reached `main`.

**What it does:** the first sprite sheets held one still frame repeated (a paused video doesn't decode new pictures when seeked). The sheets are now 72 real frames per bird, and each video is split into arriving, perched and leaving parts. The card waits 1.5 s for the bird to fly off before it moves.

**Merge:** `main` merged into the branch. One conflict in `DECISIONS.md`: the Volunteer's rewrite of the birds line, kept as theirs, with the two room-clearing lines from #46/#47 below it.

**Verify**
```
cd frontend && npm ci && npm run lint && npm run build
> eslint .
✓ built in 223ms
```

🤖 Generated with [Claude Code](https://claude.com/claude-code)


---

## Issue #51: F9: Fixes from the post-workshop frontend check

*closed, opened by Delta-43 on 2026-11-18*

Branch: `f9-review-fixes`. Found in the post-workshop check: a scripted game (host at 1920x999, 1366x768 and 1280x720, three phones at 390x844), then the better-ui and improve-animations skills over the whole frontend.

## Bugs
- A presentation clicker stops working after the host clicks the main button with the mouse: the focused button swallows Page Down and the right arrow (`usePrimaryKey`).
- On a phone, the bird's head sits on the timer: the new sprites are 1.25 times the bird's height and the header only leaves 0.95.
- The mono font gives a comma a whole digit's width, so 27,572 reads as "27 , 572" on the big screen.

## better-ui
- Press feedback at `scale(0.96)` (now 0.98 on `.button`, none on the quiet and remove buttons).
- Chips use a border for depth; use a shadow ring, tinted for the answered state.
- The remove button's "×" glyph sits off-centre; use an SVG in `currentColor`.
- The answered tick should arrive with scale 0.25 to 1, opacity and a 4px blur.
- Input focus transitions at 150 ms.

## improve-animations
- Reduced motion keeps animation delays, so content waits, unmoving, for staggers (the winner card waits about 2 s).
- The question animates `font-size` when the answer appears, re-laying the whole card every frame.

## Done when
Each item above is fixed, and a scripted game shows no console errors and no layout problems at the three host sizes.

## Verify
```sh
cd frontend && npm ci && npm run lint && npm run build
```

## Do not touch
`backend/`, `contract/`


---

## Pull request #52: F5: Frontend types match the contract

*merged, opened by Delta-43 on 2026-11-18*

Closes #38.

`frontend/src/contract.ts` now matches `contract/messages.md`:
- `question.number` added.
- `timeLimit`, `endsAt`, `serverTime` and `fact` are always sent, so they are required. `fact` stays `Fact | null`.
- The "Optional until PR 22 merges" comment is gone.

`useCountdown` drops its guards for the timer fields. The `question.fact ? [question.fact] : []` guards stay, because `fact` can still be `null`.

**The `fact` fallback:** "Pond fact" cards stay when `fact` is `null`. That is already the decision recorded on 2026-11-18 in `DECISIONS.md` ("When a question has no fact, it shows general pond facts…"), so this PR adds no new line.

Stacked on #50 (the Volunteer's birds). Review that first; this PR's own diff is the one commit.

**Verify**
```
cd frontend && npm ci && npm run lint && npm run build
> eslint .
✓ built in 213ms
```

🤖 Generated with [Claude Code](https://claude.com/claude-code)


---

## Pull request #53: F6: Stop reconnecting when the room has closed or the game is over

*merged, opened by Delta-43 on 2026-11-18*

Closes #39.

**What changes**
- `useRoom` never reconnects after close code `1000` (room cleared) or `4000` (removed), as `contract/messages.md` → Closing requires.
- It also stops reconnecting once the phase is `over`: the server has nothing left to send. Without this, a phone that slept through the clearing wakes up, gets `404` from the cleared room and retries for ever, because its socket had opened before.
- **Phone:** a finished game keeps its final card, with no banner. A room that closes before the end (2 hours idle) goes back to the join form with "Room ABCD has closed. Ask the host for the new room code." A phone that reloads into a room it played in (it has a saved `playerId`) is told "The game in room ABCD has finished" rather than "We couldn't find room ABCD".
- **Host:** the final board stays and "Open a new room" works. A room closed while idle goes back to the start screen with the reason, as a reload of a cleared room already did.

Stacked on #52.

**Verify**
```
cd frontend && npm ci && npm run lint && npm run build
> eslint .
✓ built in 212ms
```

🤖 Generated with [Claude Code](https://claude.com/claude-code)


> **Delta-43** (2026-11-18):
>
> **The check from #39**, on a local Worker started with `npx wrangler dev --var CLEAR_AFTER_MS:3000` (the 3 sample questions), with a scripted host (1280x720) and phone (390x844):
> 
> ```
> over: host no banner, phone no banner
> 14 s after over: host no banner, final board true; phone no banner, final card true
> host "Open a new room": new room ADKN
> phone reload into the cleared room: "The game in room VGEA has finished. Ask the host for the new room code."
> new phone, same code: "We couldn't find room VGEA. Check the code on the big screen."
> ```
> 
> The Worker log shows no retry loop after the room cleared: 6 handshakes for the cleared room in total, 3 for each of the two pages, each answered `404`, and then nothing. (In the dev server React's StrictMode mounts twice, which adds one; a production build makes two: the first try and one retry before "unreachable".)

---

## Pull request #54: F8: The big screen fits the window

*merged, opened by Delta-43 on 2026-11-18*

Closes #44.

Finishes the work in progress from the workshop (`c0710c9`). The game screen is one fixed-height column: the card takes what the header and footer leave, and sizes inside the card follow the card's height (`cqh`). `overflow: clip` stops focus from scrolling the screen sideways.

**What the check found beyond the issue, and fixed here**
- **Lobby:** at all three sizes the page scrolled and "Start the game" was cut off, and at 1920x999 the fourth code letter ran past the card's edge. Now a fixed-height column too: sizes are capped by the window height, the letters share the card's width, and the players list takes what is left. From 16 players the chips get smaller, so a full room of 30 (with their remove buttons) fits at 1280x720.
- **Long questions:** the chips crossed the card's bottom edge. The current card is now a column: the answers, result or leaderboard take what the question leaves and clip inside the card.
- **Answer and leaderboard steps:** once the answer is up, the question keeps two lines on the answer step and one on the leaderboard ("Question 5" stays above it). Leaderboard rows and their text follow the card's height, so eight rows fit at 1280x720.
- **Final board:** it scrolled at every size, with "Open a new room" in the water. Now a fixed-height column. A big room gets a smaller winner card and denser columns; a full room gets five columns without the time column, so all 29 places fit at 1280x720.

**How it was checked.** A Playwright script plays whole ten-question games against the test Worker: a host window and phones at 390x844, the host driven with Space as the handoff says. At every step it checks that the page doesn't scroll, that the main button's bottom edge is above the progress bar's top edge, that nothing the host needs is outside the window, and that nothing visible spills out of its card. I also looked at the screenshots, which is how the leaderboard and full-board problems above were found.

| Host window | Players | Questions | Layout problems | Console errors |
|---|---|---|---|---|
| 1920x999 | 3 | 10 of 10 | 0 | 0 |
| 1366x768 | 3 | 10 of 10 | 0 | 0 |
| 1280x720 | 3 | 10 of 10 | 0 | 0 |
| 1280x720 | 30 | 10 of 10 | 0 | 0 |

These ran on the top of the stack (this PR, F9 and T1). The only console lines were React StrictMode's dev-only "WebSocket is closed before the connection is established", one per page. A production build served under `/guess-closer/`, as Pages serves it, played two questions with no issues at all.

Before this PR, at 1920x999, the question step's button was 155 px below the window, under the progress bar.

**Screenshots:** to be attached by hand (the CLI can't upload images).

`DECISIONS.md`: one line for the fitted big screen. The merge from F6 brings F6's own line with it.

Stacked on #53.

**Verify**
```
cd frontend && npm ci && npm run lint && npm run build
> eslint .
✓ built in 185ms
```

🤖 Generated with [Claude Code](https://claude.com/claude-code)


---

## Pull request #55: F9: Fixes from the post-workshop frontend check

*merged, opened by Delta-43 on 2026-11-18*

Closes #51.

Fixes from the post-workshop check of the frontend: a scripted game at three host sizes with three phones, then the **better-ui** and **improve-animations** skills over the whole of `frontend/src`. (Impeccable isn't installed on this machine, so it didn't run.)

**Bugs**
- **Clicker.** After the host clicked the main button with the mouse, the focused button swallowed every key, so a presentation clicker (Page Down, right arrow) did nothing. Only Space and Enter are left to a focused button now. Checked: on `main` the game stays on "Show the answer" after Page Down and the right arrow; with this PR it moves to "Leaderboard" and then "Next question".
- **Bird on the timer.** The new sprites are 1.25 times the bird's height, so on a phone the bird's head sat on the flip clock. The header leaves room for it.
- **"27 , 572".** JetBrains Mono gives a comma a whole digit's width, so big answers read with a gap. `<Digits>` pulls the separator in on display numbers (answer, guesses, sent answer).

**better-ui**
- Press feedback at `scale(0.96)` on buttons, the quiet button and the remove button.
- Chips: a shadow ring instead of a border; the answered state tints the ring.
- Remove button: an SVG cross in `currentColor`, centred, instead of the "×" glyph.
- The answered tick arrives with scale 0.25 to 1, opacity and a 4px blur, `cubic-bezier(0.2, 0, 0, 1)`.
- Input focus transitions at 150 ms, naming `background-color`.

**improve-animations**
- Reduced motion drops animation and transition delays too. Before, the winner card and the result rows still waited (about 2 s) before appearing, with no motion to show for it. Checked: with reduced motion the result rows are fully visible 300 ms after `show`.
- The question no longer animates `font-size` when the answer appears: that re-laid the whole card every frame on the projector. It snaps while the answer slides in.
- Left as they are, by design: the split-flap `ease-in` fold (a falling flap), the birds' own take-off curves, and the `width` and `top` transitions on the progress tube and the glass arrow (small, once a question).

`DECISIONS.md`: one line for the clicker keys.

Stacked on #54.

**Verify**
```
cd frontend && npm ci && npm run lint && npm run build
> eslint .
✓ built in 219ms
```

🤖 Generated with [Claude Code](https://claude.com/claude-code)


---

## Pull request #56: T1: Catch frontend drift from the contract in CI

*merged, opened by Delta-43 on 2026-11-18*

Closes #40.

`npm test` in `frontend/` turns every `contract/examples/*.json` into a typed fixture and runs `tsc` on them:

```ts
// .contract-check/examples.ts, generated, gitignored
export const state_question = { ... } satisfies GameState
export const error = { ... } satisfies ServerError
export const join = { ... } satisfies ClientMessage
```

`satisfies` checks both ways: a field the contract has and the types lack is an excess property, and a field the types require that the contract doesn't send is missing. The CI frontend job runs it after the build.

**Proof it fails.** With the types from before F5:
```
.contract-check/examples.ts(94,5): error TS2353: Object literal may only specify known properties, and '"number"' does not exist in type 'Question'.
.contract-check/examples.ts(133,5): error TS2353: Object literal may only specify known properties, and '"number"' does not exist in type 'Question'.
.contract-check/examples.ts(172,5): error TS2353: Object literal may only specify known properties, and '"number"' does not exist in type 'Question'.
The frontend types in src/contract.ts do not match contract/examples. Change the contract first, then the types.
```
With a deliberate rename of `answeredCount`:
```
.contract-check/examples.ts(64,3): error TS2353: Object literal may only specify known properties, and '"answeredCount"' does not exist in type 'GameState'.
.contract-check/examples.ts(90,3): error TS2353: Object literal may only specify known properties, and '"answeredCount"' does not exist in type 'GameState'.
.contract-check/examples.ts(129,3): error TS2353: Object literal may only specify known properties, and '"answeredCount"' does not exist in type 'GameState'.
.contract-check/examples.ts(168,3): error TS2353: Object literal may only specify known properties, and '"answeredCount"' does not exist in type 'GameState'.
The frontend types in src/contract.ts do not match contract/examples. Change the contract first, then the types.
```

One catch along the way: TypeScript's `include` globs skip directories whose names start with a dot, so the generated file is listed in `files`. The first version passed everything because it compiled nothing.

Stacked on #55.

**Verify**
```
cd frontend && npm ci && npm run lint && npm run build && npm test
> eslint .
✓ built in 219ms
Contract check: 12 examples match the frontend types.
```

🤖 Generated with [Claude Code](https://claude.com/claude-code)

