# Decisions

One line per decision, added in the pull request that made it.

- 2026-11-12: Score by relative error (distance ÷ answer), 3-2-1 points. Answers range from 16 to over a million.
- 2026-11-12: Backend and frontend in separate folders, with one shared contract merged first. Two agents rarely touch the same file.
- 2026-11-12: A room holds at most 30 players.
- 2026-11-18: Each question has a time limit (default 20 s) kept by the server. After it, answers get `time_up`; the host still presses `reveal`.
- 2026-11-18: Each question can carry a "Did you know?" fact, sent with the question, so it must never contain the answer.
- 2026-11-18: Questions are shuffled for each new room. A finished room clears itself after 10 minutes and nothing is kept.
- 2026-11-18: Every question has a fixed `number`; "Did you know?" cards are kept by number (`backend/TRIVIA.md`) so they stay right when the room shuffles.
