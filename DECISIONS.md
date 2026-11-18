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
- 2026-11-18: After `show` the big screen adds a Leaderboard step before `next`. It lives only in the frontend: the server stays in `reveal` until the host presses Next.
- 2026-11-18: Alban's birds (Peking duck, bath duck, puffin, goose, teal) are cut out of their videos into 72-frame sprite sheets in frontend/public/birds/, captured during playback. Each video is split into parts: the bird arrives, plays its standing-about part while perched, and plays its take-off when the card is about to move. The black background is removed by tracing each silhouette, so black plumage and ink lines stay.
- 2026-11-18: A room that is not finished clears itself after 2 hours without activity (close code 1000, reason "idle"). A finished room clears 10 minutes after `over` (reason "game over"). Clients never reconnect after 1000 or 4000.
- 2026-11-18: Rooms clear from one pure plan (src/clearing.js): 2 hours idle, or 10 minutes after the game ends, whichever applies. Rejected messages do not count as activity.
- 2026-11-19: Once the phase is `over` a client never reconnects, whatever the close code: the server has nothing left to send, and a phone that slept through the clearing would otherwise retry a cleared room for ever.
- 2026-11-19: The big screen fits the window it is shown in. The lobby and the game are fixed-height columns, and sizes follow the window height (and, inside the card, the card's height), so the main button is never below the screen or under the progress bar. A full lobby shrinks its name chips rather than pushing the button off.
