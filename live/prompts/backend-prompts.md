# Backend prompts for the live build

> **As used on the day (18 November 2026).** The stage Worker and the GitHub organisation named below have since been taken down. To run the finished game, use the `Dockerfile` in this folder (see the [README](../README.md)).

For Delta, who owns `backend/`. The frontend starts from [`frontend-start.md`](frontend-start.md). These prompts rebuild the demo backend in the stage repository, one issue at a time. Each one pins the behaviour of the finished backend, so the result passes the same acceptance test (`backend/test/e2e.mjs`) and works with any frontend built to the contract.

The order is B1, B4, B2, B3, B5, B6, B7: B2 calls the timer module from B4. B1 to B3 and the contract were tested on 2026-11-17 by a fresh agent in a scratch branch. **B4 to B7 and the timer, number and fact changes to B1 to B3 (2026-11-18) have not been re-run by a fresh agent yet.** They were written from the finished code, which passes `npm test` (48 tests) and `e2e.mjs all`. Run the whole sequence once in a scratch branch before you rely on it on stage.

Before you start: the contract pull request (PR 15, `c1-contract`) is merged, `git pull` has brought it into your clone's `main`, and you are on a new branch for the issue. Each task is one issue (B1 #3, B2 #4, B3 #5, B4 #23, B5 #28, B6 #31, B7 #45): open its pull request with `Closes #N` in the description.

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
  Three public sample questions, each { "text", "unit", "answer", "fact" } where fact is
  { "text", "source" } and never contains the answer:
  piano keys 88 "keys"; bones in an adult human 206 "bones"; minutes in a week 10080 "minutes".
  (Copy the three facts from backend/src/questions.sample.json in the repository.)

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
    answerTimes {}, questionOpenedAt null, questionEndsAt null, reveal null, answerShown false, nextPlayer 1,
    lastActivity (now), overAt null, and questions. Questions come from env.QUESTIONS (a JSON
    string of the same shape) when it parses to a non-empty array, otherwise from the sample
    file. Keep only text, unit, answer, timeLimit, fact.
    Reply 201 { code, hostToken }.
  - Any other request: no game means 404 { "error": "no_room" }. A ?host= value that is not
    the host token means 403. Otherwise accept the WebSocket with the hibernation API
    (ctx.acceptWebSocket) and attach { role: "host" | "player", playerId: null } with
    serializeAttachment. A host gets a state message at once.
  - stateFor(ws) builds the state message from the contract for that socket, and
    broadcast() sends each open socket its own state. In this task only the lobby
    exists: players [], answeredCount 0, question null, reveal null, answerShown false,
    you { role, playerId, answer: null }. Later tasks add the question fields (see B2).

Done when: npm test passes, and node test/e2e.mjs rooms prints "e2e ok (rooms)".
Do not touch: frontend/, contract/, backend/test/e2e.mjs.
```

## 2. Issue B4: the answer timer (before B2)

Branch `b4-timer`. Needs nothing from B1; do it before B2. Verify: `cd backend && npm ci && npm test`.

```text
Task B4, the answer timer. Read "The timer" in contract/messages.md. Create exactly these
files in backend/. Write the tests first, run them and see them fail, then write the code.

src/timer.js  (pure functions, no clock reads: callers pass "now" in; limits are in seconds,
times in milliseconds)
  - DEFAULT_TIME_LIMIT 20, MIN_TIME_LIMIT 5, MAX_TIME_LIMIT 120.
  - timeLimitFor(question): the question's timeLimit if it is an integer from 5 to 120,
    otherwise 20.
  - endsAt(openedAt, limit): openedAt + limit * 1000.
  - acceptsAnswer(now, endsAt): true up to and including endsAt, false after.
  - timeLeftMs(now, endsAt): never negative.
  - answerTime(openedAt, answeredAt, limit): clamped to 0..limit*1000.
  - noAnswerTime(openedAt, now, limit): how long the question was open, clamped to
    0..limit*1000 (the contract: never more than timeLimit).

test/timer.test.js (node:test and node:assert/strict). Cover: the default and bad limits;
endsAt arithmetic; an answer exactly at endsAt is accepted and 1 ms later is not; timeLeftMs
never negative; answerTime clamps; noAnswerTime is shorter after an early reveal, exactly
the limit after a late one, and never negative.

Done when: npm test passes. Do not touch: frontend/, contract/, room.js (it may not exist yet),
backend/test/e2e.mjs, backend/test/contract.test.js.
```

## 3. Issue B2: join and answer intake

Branch `b2-answers`. Needs B1 and B4. Verify: `npm test`, then `node test/e2e.mjs answers` against `npm run dev`.

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
  - Use timer.js. If acceptsAnswer(now, questionEndsAt) is false: time_up (nothing changes).
    Check the phase first, then the time, then that value is a finite number.
  - Store answers[playerId] = value. A second answer replaces the first.
  - Store answerTimes[playerId] = answerTime(questionOpenedAt, now, limit). A changed answer
    restarts the time.

start, kick (host only; a player gets not_allowed)
  - start: only in "lobby" and with at least one player, else wrong_phase. Open question 0
    with one helper, openQuestion(index), that sets phase "question", questionIndex, answers {},
    answerTimes {}, questionOpenedAt now, questionEndsAt = endsAt(now, timeLimitFor(question)),
    reveal null, answerShown false. "next" uses the same helper.
  - kick: remove the player, their answer and their answer time, and close every socket
    of that player with code 4000 and reason "removed". Allowed in every phase.

State, as in the contract:
  - players[]: id, name, score, time, connected (a socket for that player is open),
    answered (true in "question" and "reveal" when the player has an answer).
  - answeredCount: the number of answers to the current question.
  - question: null in "lobby" and "over", else { index, total, number, text, unit, timeLimit,
    endsAt, serverTime, fact }. number is the question's fixed number (see B5), serverTime is
    Date.now() when the message is built, fact is { text, source } or null. Never the answer.
  - you.answer: this player's own answer or null. Nobody sees another player's answer.
  - webSocketClose and webSocketError: broadcast, so "connected" updates. Find a player's
    sockets by their attachment (hibernation tags cannot be set after accept) and count only
    sockets with readyState 1.
  - time_up is in the error codes. Add it to the list of codes you send.

Done when: npm test passes, and node test/e2e.mjs answers prints "e2e ok (answers)".
Do not touch: frontend/, contract/, backend/test/e2e.mjs.
```

## 4. Issue B3: scoring

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
    or, with no answer, noAnswerTime(questionOpenedAt, now, limit) from timer.js (never more
    than the time limit). reveal works before and after the timer ends: there is no automatic reveal. Store reveal = { correct, results }.
    Phase "reveal", answerShown false.
  - show: only in "reveal", else wrong_phase. Set answerShown true. Sending it again is fine.
  - next: only in "reveal", else wrong_phase. After the last question: phase "over",
    reveal null, answerShown false, and overAt = now (B7 uses it). Otherwise open the next
    question with openQuestion().
  - State: answerShown is true only in "reveal" after show. The host always gets the full
    reveal. A PLAYER in "reveal" before show gets reveal: null, and every players[].score
    without this round's points. players[].time is not held back: it already includes
    this round for everyone. In "over", players are in finalOrder.

Done when: npm test passes with the new scoring tests, and node test/e2e.mjs all prints
"e2e ok (all)".
Do not touch: frontend/, contract/, backend/test/e2e.mjs.
```

## 5. Issue B5: shuffle and clear

Branch `b5-shuffle-clear`. Needs B3. Verify: `npm test`, then `node test/e2e.mjs all`. This task
only changes how a finished room clears; B7 replaces that with one plan, so if you run B7
straight after, B5's alarm code is replaced by it.

```text
Task B5, shuffle the questions and clear a finished room. Extend backend/.

src/shuffle.js: shuffled(list, random = Math.random), a Fisher-Yates that returns a new array.
test/shuffle.test.js: keeps every item and does not change the input; follows the random source
(shuffled([1,2,3], () => 0) is [2,3,1]); changes the order of ten items in at least one of 20 runs.

In room.js, when a room is created, number the questions first (number = place in the list,
from 1), then shuffle them. The number never changes, so the cards in B6 stay with their question.

When the phase becomes "over", the room clears itself after env.CLEAR_AFTER_MS (default 600000,
10 minutes) with a Durable Object alarm: alarm() closes every socket with close code 1000 and
reason "game over", calls ctx.storage.deleteAll() and sets this.game to null. A room that
has cleared answers /ws with 404 no_room, and its code can be used again.

Done when: npm test passes, and node test/e2e.mjs all prints "e2e ok (all)". Try the clearing on a
local Worker with --var CLEAR_AFTER_MS:3000 and show me that a new connection is accepted before
the clear and refused after it.
Do not touch: frontend/, contract/, backend/test/e2e.mjs, backend/test/contract.test.js.
```

## 6. Issue B6: trivia cards by question number

Branch `b6-trivia`. Needs B5 and the contract change that adds question.number (C3). Verify: `npm test`, then `node test/e2e.mjs all`.

```text
Task B6, "Did you know?" cards. Extend backend/. The cards are research, not code: copy
backend/src/trivia.json and backend/TRIVIA.md from the repository instead of writing them. They
hold one spoiler-free card per live question, keyed by question number, and no question text or answers.

src/trivia.js (imports ./trivia.json with { type: "json" })
  - numbered(list): each question plus number = place in the list, from 1.
  - cardFor(number, table = cards): { number, text, source } or null.
  - withCards(list, table = cards): fills in "fact" ({ text, source }, or null) for questions that
    have no fact of their own.

test/trivia.test.js: ten cards numbered 1 to 10; every card is 1 to 280 characters with an https
source; TRIVIA.md has a "| N |" row for every card; numbered, cardFor and withCards behave as above,
including that a card follows its question after the list is reversed, and that a question's own
fact is kept.

In room.js, questions from env.QUESTIONS go through withCards(numbered(list)) before the shuffle.
The sample set carries its own facts and is only numbered.
In index.js, GET /api/trivia/<number> returns the card as JSON with the usual CORS headers, or
404 { "error": "no_card" }.

Done when: npm test passes, and a local Worker started with ten dummy questions in QUESTIONS plays two
games where every question carries its own card and GET /api/trivia/11 is 404.
Do not touch: frontend/, contract/, backend/test/e2e.mjs, backend/test/contract.test.js.
```

## 7. Issue B7: clear abandoned rooms

Branch `b7-idle-clear`. Needs B5 and the contract's "Closing" section (C4). Verify: `npm test`, then `node test/e2e.mjs all`.

```text
Task B7, clear rooms that are abandoned. Read "Closing" in contract/messages.md. Extend backend/.
Write the tests first.

src/clearing.js (pure)
  - DEFAULT_IDLE_MS 7200000 (2 hours), DEFAULT_CLEAR_AFTER_MS 600000 (10 minutes).
  - clearPlan(game, env) returns { at, reason }. If game.overAt is set: overAt + CLEAR_AFTER_MS,
    reason "game over". Otherwise (lastActivity ?? 0) + IDLE_CLEAR_MS, reason "idle". A setting
    that is not a number above 0 falls back to its default.
test/clearing.test.js: the defaults; idle from lastActivity; after "over" nothing later postpones it;
both settings are used; bad settings fall back.

In room.js: set lastActivity = now on create, on every WebSocket connection with a valid host token
(or none), and after every accepted message; a rejected message (an error reply) is not activity.
After each save, set the alarm to clearPlan(game, env).at. In alarm(): if there is no game, return;
if now is before the plan's time, set the alarm again and return; otherwise close every socket with
code 1000 and the plan's reason, deleteAll(), and set this.game to null.

Done when: npm test passes, node test/e2e.mjs all prints "e2e ok (all)", and a local Worker started with
--var IDLE_CLEAR_MS:3000 --var CLEAR_AFTER_MS:6000 shows: an untouched room refused after 4 seconds;
a finished room cleared 6 seconds after "over" even with a new connection every second.
Do not touch: frontend/, contract/, backend/test/e2e.mjs, backend/test/contract.test.js.
```

## After B7

```sh
cd backend && npx wrangler deploy          # the stage deploy, by hand
node test/e2e.mjs all <address of the deployed Worker>
```

On the day the `QUESTIONS` secret was already set on the stage Worker, so the deployed game used the real ten questions. Their cards come from `src/trivia.json` by question number: read each card against the real answer before you deploy, because the tests cannot see the answers.

## If it goes wrong

If an agent stalls for about three minutes, Delta switches to a prepared checkpoint of the finished backend, opens a pull request from it as usual, and says so on stage.
