# Backend prompts for the live build

For Delta, who owns `backend/`. The frontend starts from [`frontend-start.md`](frontend-start.md). These prompts rebuild the demo backend in `delta-workshops/guess-closer`, one issue at a time. Each one pins the behaviour of the finished backend, so the result passes the same acceptance test (`backend/test/e2e.mjs`) and works with any frontend built to the contract.

Tested on 2026-11-17: a fresh agent ran prompts 0 to 3 in a scratch branch, and every stage passed first time (20 unit tests; e2e `rooms`, `answers` and `all`). The acceptance test also passes against the finished backend and against the test Worker.

Before you start: the contract pull request (PR 15, `c1-contract`) is merged, `git pull` has brought it into your clone's `main`, and you are on a new branch for the issue. Each task is one issue (B1 #3, B2 #4, B3 #5): open its pull request with `Closes #N` in the description.

## Collect the skills

Two skills for the backend side of slide 26. Each one reports; it does not rewrite.

- **Run the install commands yourself**, in your own terminal, not through the agent. Auto mode's classifier blocks an agent from downloading and running a third-party installer, and that block is the point of slide 31.
- **Read each `SKILL.md` at its link first.**
- `-g` installs for your user only, so nothing lands in the live repo. Both are pinned to a commit from 2026-11-17. The `skills` installer needs Node.js 22.20 or later. Start a new agent session after installing.

| Moment | Skill | Read first | Install |
|---|---|---|---|
| C1: the contract PR (PR 15), before approval | API Contract Review | [Mozurok/fhorja.dev: api-contract-review](https://github.com/Mozurok/fhorja.dev/blob/main/.claude/skills/api-contract-review/SKILL.md) (MIT) | `npx skills add Mozurok/fhorja.dev@1abe596aff3cd974459118b57ecd631a69ea34f0 --skill api-contract-review -a claude-code -g` |
| B1 to B3: each backend PR, before you open it | Clean Code | [davila7/claude-code-templates: clean-code](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/skills/development/clean-code/SKILL.md) (MIT) | `npx skills add davila7/claude-code-templates@5e5cc3db7f9fb71bc2316417293cc2fc778ce482 --skill clean-code -a claude-code -g` |

**Know before you use them.**

- **API Contract Review** belongs to a larger workflow system ("Fhorja"). It asks the agent to read that system's files first (`WORKFLOW_OPERATING_SYSTEM.md`, `TASK_STATE.md`, `IMPLEMENTATION_PLAN.md`, about 12,000 tokens), and none of them exist in our repo. It is also written for REST endpoints (pagination, HTTP methods, versioning), and our contract is WebSocket messages. The prompt below tells it to skip both. Expect a few findings that don't apply; reading one aloud and saying why it doesn't apply is a good teaching moment ("a reviewer will always find something").
- **Clean Code** is a coding-standards skill with `allowed-tools: Read, Write, Edit`, and it encourages leaving code "cleaner than you found it". The prompt below keeps it to a report.

Prompt for the contract moment (PR 15, run in your clone on `c1-contract`):

```text
Use the api-contract-review skill on contract/messages.md, contract/schema.json and
contract/examples/. Our repo has no WORKFLOW_OPERATING_SYSTEM.md, TASK_STATE.md or
IMPLEMENTATION_PLAN.md: skip that bootstrap and use PLAN.md and contract/ instead. This is
a WebSocket message contract, not a REST API: skip pagination, HTTP methods and URL
versioning. Check message names, field names and types, error codes, what each role may
send, and whether the examples match the schema. Report findings only, most important
first, at most five. Do not edit any file.
```

Prompt for each backend PR (after the verify command passes):

```text
Use the clean-code skill to review the diff of this branch against main, in backend/ only.
Report at most five findings that matter for correctness or readability, most important
first. Do not edit any file: I choose what to fix.
```

## 0. Session start (paste once)

```text
You are helping me build the backend of Guess Closer!, a live quiz game for a room.
I own backend/. My teammate owns frontend/. We share contract/.

Read AGENTS.md, PLAN.md, DECISIONS.md, contract/messages.md, contract/schema.json and
backend/test/e2e.mjs. The contract is the agreement. The e2e script is the acceptance test.
Tell me in five lines what the backend must do. Do not write code yet.

Rules for the whole session:
- Work only in backend/. Never edit frontend/ or contract/. Never edit backend/test/e2e.mjs
  or backend/test/contract.test.js.
- Plain JavaScript (ES modules), no TypeScript, no new dependencies.
- Follow the contract exactly: field names, phases, error codes. Where the contract is
  silent, follow the details I give you in each task, and nothing else.
- Run the verify command and show me its output before you say a task is done.
- Never read or print secrets or .env files. Never deploy: I do that by hand.
```

## 1. Issue B1: rooms and codes

Branch `b1-rooms`. Verify: `cd backend && npm ci && npm test && npm run dev`, then in a second terminal `node test/e2e.mjs rooms`.

```text
Task B1, rooms and codes. Create exactly these files in backend/:

wrangler.jsonc
  name "guess-closer-live", main "src/index.js", compatibility_date "2026-11-01",
  one Durable Object binding named ROOM with class_name "Room",
  migrations: [{ "tag": "v1", "new_sqlite_classes": ["Room"] }].

src/questions.sample.json
  Three public sample questions, each { "text", "unit", "answer" }:
  piano keys 88 "keys"; bones in an adult human 206 "bones"; minutes in a week 10080 "minutes".

src/index.js  (the Worker; it also re-exports Room from ./room.js)
  - OPTIONS on any path: 204 with CORS headers.
  - GET /api/health: { "ok": true }.
  - POST /api/rooms: make a 4-letter code from the letters A-Z without I and O. Get the
    Durable Object for that code with env.ROOM.idFromName(code) and POST to its /create
    path (the Room treats a request whose pathname is exactly /create as creation and every
    other request as a WebSocket connect) with the header x-room-code. If the reply is 201, return it. If not (the code is
    taken), try a new code, up to 5 times, then return 503 { "error": "no_room" }.
  - /api/rooms/<CODE>/ws where CODE is four capital letters: if the request is not a
    WebSocket upgrade, return 426. Otherwise forward the request to that room's Durable Object.
  - Anything else: 404 { "error": "no_room" }.
  - Every non-WebSocket reply carries Access-Control-Allow-Origin (env.ALLOWED_ORIGIN or "*"),
    Access-Control-Allow-Methods "GET, POST, OPTIONS" and Access-Control-Allow-Headers "Content-Type".

src/room.js  (class Room extends DurableObject from "cloudflare:workers")
  - One Room per game. All game state is one object, this.game, stored under the key "game"
    with ctx.storage and saved after every change. Load it in the constructor inside
    ctx.blockConcurrencyWhile, because a hibernated object forgets its memory.
  - /create: if a game exists return 409. Otherwise create it: code (from the header),
    hostToken (crypto.randomUUID()), phase "lobby", players [], questionIndex -1, answers {},
    answerTimes {}, questionOpenedAt null, reveal null, answerShown false, nextPlayer 1, and
    questions. Questions come from env.QUESTIONS (a JSON string of the same shape) when it
    parses to a non-empty array, otherwise from the sample file. Keep only text, unit, answer.
    Reply 201 { code, hostToken }.
  - Any other request: no game means 404 { "error": "no_room" }. A ?host= value that is not
    the host token means 403. Otherwise accept the WebSocket with the hibernation API
    (ctx.acceptWebSocket) and attach { role: "host" | "player", playerId: null } with
    serializeAttachment. A host gets a state message at once.
  - stateFor(ws) builds the state message from the contract for that socket, and
    broadcast() sends each connected socket its own state. In this task only the lobby
    exists: players [], answeredCount 0, question null, reveal null, answerShown false,
    you { role, playerId, answer: null }.

Done when: npm test passes, and node test/e2e.mjs rooms prints "e2e ok (rooms)".
Do not touch: frontend/, contract/, backend/test/e2e.mjs.
```

## 2. Issue B2: join and answer intake

Branch `b2-answers`. Verify: `npm test`, then `node test/e2e.mjs answers` against `npm run dev`.

```text
Task B2, join and answer intake. Extend backend/src/room.js. Handle messages in
webSocketMessage. After every accepted message: save, then broadcast.

Errors are sent as { type: "error", code, message } to that socket only, and nothing is
saved or broadcast. Not JSON, or no string "type": bad_message. Unknown type: bad_message.

join (players only; a host gets not_allowed)
  - Trim the name. Empty or longer than 16 characters: bad_name.
  - If msg.playerId matches an existing player, attach this socket to that player
    (coming back after a dropped connection). Score and answers are kept.
  - Otherwise: 30 players already means room_full. A name equal to an existing one,
    ignoring capitals, means name_taken. Else add { id: "p" + nextPlayer++, name, score: 0,
    time: 0 } and attach the id to the socket.

answer (players who have joined; otherwise not_allowed)
  - Only in phase "question": else wrong_phase. value must be a finite number: else bad_message.
  - Store answers[playerId] = value. A second answer replaces the first.
  - Store answerTimes[playerId] = milliseconds since the question opened. A changed answer
    restarts the time.

start, kick (host only; a player gets not_allowed)
  - start: only in "lobby" and with at least one player, else wrong_phase. Open question 0:
    phase "question", questionIndex 0, answers {}, answerTimes {}, questionOpenedAt now,
    reveal null, answerShown false.
  - kick: remove the player, their answer and their answer time, and close every socket
    of that player with code 4000 and reason "removed". Allowed in every phase.

State, as in the contract:
  - players[]: id, name, score, time, connected (a socket for that player is open),
    answered (true in "question" and "reveal" when the player has an answer).
  - answeredCount: the number of answers to the current question.
  - question: null in "lobby" and "over", else { index, total, text, unit }. Never the answer.
  - you.answer: this player's own answer or null. Nobody sees another player's answer.
  - webSocketClose and webSocketError: broadcast, so "connected" updates.

Done when: npm test passes, and node test/e2e.mjs answers prints "e2e ok (answers)".
Do not touch: frontend/, contract/, backend/test/e2e.mjs.
```

## 3. Issue B3: scoring

Branch `b3-scoring`. Verify: `npm test`, then `node test/e2e.mjs all` against `npm run dev`.

```text
Task B3, scoring. Two parts.

Part 1: backend/src/scoring.js, pure functions, with tests in backend/test/scoring.test.js
(node:test and node:assert/strict). Write the tests first.
  - relativeError(value, correct) = abs(value - correct) / abs(correct).
  - scoreRound(answers, correct). answers is [{ playerId, name, value, time }], value is a
    number or null, time is milliseconds or null. Returns results in rank order, each
    { playerId, name, value, error, time, rank, points }.
    Players with a number: sort by error, then by time (earlier first). Ranks are 1, 2, 3...
    and are never shared. Points: 3, 2, 1, then 0.
    Players with no answer come last with value, error, time and rank null and 0 points.
  - finalOrder(players): a new array, more score first, equal score goes to the lower time.
  Tests to write: the relative error formula; relative error beats plain distance for big
  answers; points are 3, 2, 1 and then 0; equal error ranks the earlier answer higher and
  ranks are never shared; a closer answer beats a faster one; final order by points, then
  by lower total time; players with no answer score 0 and have no rank.

Part 2: extend backend/src/room.js with the host messages reveal, show and next.
  - reveal: only in "question", else wrong_phase. Score the round with scoreRound, giving
    each player value answers[id] ?? null and time answerTimes[id] ?? null. Add each
    result's points to the player's score. Add to the player's total time: the result's time,
    or, with no answer, the whole time the question was open. Store reveal = { correct, results }.
    Phase "reveal", answerShown false.
  - show: only in "reveal", else wrong_phase. Set answerShown true. Sending it again is fine.
  - next: only in "reveal", else wrong_phase. After the last question: phase "over",
    reveal null, answerShown false. Otherwise open the next question as in start.
  - State: answerShown is true only in "reveal" after show. The host always gets the full
    reveal. A PLAYER in "reveal" before show gets reveal: null, and every players[].score
    without this round's points. players[].time is not held back: it already includes
    this round for everyone. In "over", players are in finalOrder.

Done when: npm test passes with the new scoring tests, and node test/e2e.mjs all prints
"e2e ok (all)".
Do not touch: frontend/, contract/, backend/test/e2e.mjs.
```

## After B3

```sh
cd backend && npx wrangler deploy          # replaces the test Worker guess-closer-live
node test/e2e.mjs all https://guess-closer-live.delta-43.workers.dev
```

The `QUESTIONS` secret is already set on `guess-closer-live`, so the deployed game uses the real ten questions.

## If it goes wrong

If an agent stalls for about three minutes, Delta switches to a prepared checkpoint of the finished backend, opens a pull request from it as usual, and says so on stage.
