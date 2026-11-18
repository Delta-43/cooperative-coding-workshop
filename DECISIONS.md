# Decisions

One line per decision, added in the pull request that made it.

- 2026-11-12: Score by relative error (distance ÷ answer), 3-2-1 points. Answers range from 16 to over a million.
- 2026-11-12: Backend and frontend in separate folders, with one shared contract merged first. Two agents rarely touch the same file.
- 2026-11-12: A room holds at most 30 players.
- 2026-11-18: Each question has a time limit (default 20 s) kept by the server. After it, answers get `time_up`; the host still presses `reveal`.
- 2026-11-18: Each question can carry a "Did you know?" fact, sent with the question, so it must never contain the answer.
- 2026-11-18: Questions are shuffled for each new room. A finished room clears itself after 10 minutes and nothing is kept.
- 2026-11-18: Every question has a fixed `number`; "Did you know?" cards are kept by number (`backend/TRIVIA.md`) so they stay right when the room shuffles.
- 2026-11-18: The frontend is rebuilt from source in frontend/ with a warm paper scrapbook look (cream canvas, near-black ink, Lora headings, Figtree text, pastel shapes, pill buttons), canvas-drawn water, squircle cards and bird illustrations in frontend/public/ducks/.
- 2026-11-18: The host's QR code encodes the address the host is using (location.origin + location.pathname) plus ?room=ABCD, so a scan fills in the code.
- 2026-11-18: While a player waits, the fact card rotates every 20 seconds. When a question has no fact, it shows general pond facts (labelled "Pond fact", never about the question) instead of nothing.
- 2026-11-18: The host drives the game with one main button, also on Space, Enter or the right arrow, so a presentation clicker works. A refresh of the big screen rejoins the same room.
