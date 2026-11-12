# Contract: Closest Number

This file is the agreement between the frontend and the backend. Change it first, in its own pull request, and merge it before anyone builds on the change.

Messages are JSON. `schema.json` is the machine-readable version and `examples/` holds one example of each message. CI checks that the examples match the schema.

## Roles

| Role | Who | Screen |
|---|---|---|
| `host` | Runs the game | Big screen |
| `player` | Joins with a code or QR | Phone |

## Connecting

1. The host creates a room: `POST /api/rooms`. The reply is `201` with `{ "code": "KQWZ", "hostToken": "..." }`. The code is four capital letters.
2. The host opens a WebSocket: `/api/rooms/KQWZ/ws?host=<hostToken>`.
3. A player opens a WebSocket: `/api/rooms/KQWZ/ws`, then sends a `join` message.
4. After every change the server sends every connected client a fresh `state` message. Clients draw the screen from the latest `state`. Clients do not keep their own copy of the game.

The frontend reads the backend address from a setting (`BACKEND_URL`), so it can point at a mock, a test Worker or the live one.

## Phases

`lobby` → `question` → `reveal` → `question` → ... → `over`

## Messages from the client

| `type` | Who | Fields | When |
|---|---|---|---|
| `join` | player | `name` (1 to 16 characters), `playerId` (optional) | First message. Send the saved `playerId` to come back after a dropped connection |
| `answer` | player | `value` (number) | During `question`. A second answer replaces the first |
| `start` | host | none | In `lobby`, with at least one player |
| `reveal` | host | none | In `question` |
| `next` | host | none | In `reveal`. After the last question the phase becomes `over` |
| `kick` | host | `playerId` | Any time |

## Messages from the server

### `state`

```json
{
  "type": "state",
  "code": "KQWZ",
  "phase": "reveal",
  "players": [
    { "id": "p1", "name": "Ada", "score": 3, "connected": true, "answered": true }
  ],
  "answeredCount": 1,
  "question": { "index": 0, "total": 8, "text": "How many keys does a standard piano have?", "unit": "keys" },
  "you": { "role": "player", "playerId": "p1", "answer": 88 },
  "reveal": {
    "correct": 88,
    "results": [
      { "playerId": "p1", "name": "Ada", "value": 88, "error": 0, "rank": 1, "points": 3 }
    ]
  }
}
```

- `question` is `null` in `lobby` and `over`.
- `reveal` is `null` unless the phase is `reveal`. **The correct answer is never sent before `reveal`.**
- `you.answer` is your own answer, or `null`. In `question` a player never sees other players' answers.
- A host has `you.role` set to `host` and no `playerId`.

### `error`

```json
{ "type": "error", "code": "name_taken", "message": "That name is already in use." }
```

| `code` | Meaning |
|---|---|
| `bad_message` | Not valid JSON, or does not match the schema |
| `wrong_phase` | The message is not allowed in this phase |
| `not_allowed` | A player sent a host message |
| `name_taken` | Another player already has that name |
| `bad_name` | The name is empty or too long |
| `room_full` | The room has 30 players |
| `no_room` | The room code does not exist (HTTP `404`) |

## Scoring

The scoring rule is **relative error**:

```
error = abs(value - correct) / abs(correct)
```

- A smaller error is better. Players with no answer are not ranked and score 0.
- Players with the same error share a rank. Points are 3 for rank 1, 2 for rank 2, 1 for rank 3 and 0 after that.
- A tie for rank 1 gives both players 3 points. The next rank is then 3, so rank 2 is skipped. Rank 3 still scores 1.
- Why relative error: the answers range from 16 to over a million. With plain distance, large answers would always lose.

## Rules for the room

- Names are trimmed. They must be unique, ignoring capitals.
- The host can remove a player with `kick`.
- A room holds at most 30 players.
- Questions come from the backend. The repository ships a small sample set. The real set is added when the Worker is deployed.
