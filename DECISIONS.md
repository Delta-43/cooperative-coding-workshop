# DECISIONS.md

One line per decision: the date, what we decided, and why. Newest at the bottom.

- 2026-11-12: Score by relative error (distance ÷ answer), 3-2-1 points. Answers range from 16 to over a million.
- 2026-11-12: Backend and frontend in separate folders, with one shared contract merged first. Two agents rarely touch the same file.
- 2026-11-12: A room holds at most 30 players.
- 2026-11-13: Equal error goes to the earlier answer; a changed answer restarts the time. No shared places (PR #1).
- 2026-11-13: Equal final scores go to the lower total answer time (PR #1).
- 2026-11-13: The projector shows counts and the top 3 or 5 only. Nobody's miss is shown by name.
- 2026-11-13: The host drives the game with Space, Backspace and Esc, so a clicker works.
- 2026-11-14: Phones get a round's result only after the big screen shows the answer (host message `show`). The server holds it back, so no phone can spoil the reveal.
