# Decisions

One line per decision, added in the pull request that made it.

- 2026-11-12: Score by relative error (distance ÷ answer), 3-2-1 points. Answers range from 16 to over a million.
- 2026-11-12: Backend and frontend in separate folders, with one shared contract merged first. Two agents rarely touch the same file.
- 2026-11-12: A room holds at most 30 players.
- 2026-11-18: The frontend is rebuilt from source in frontend/ with a warm paper scrapbook look (cream canvas, near-black ink, Lora headings, Figtree text, pastel shapes, pill buttons), canvas-drawn water, squircle cards and bird illustrations in frontend/public/ducks/.
- 2026-11-18: The join address may carry the room as ?room=ABCD, so a QR scan fills in the code. The QR still encodes location.origin + location.pathname.
- 2026-11-18: While a player waits, the fact card rotates every 20 seconds. When a question has no fact, it shows general pond facts (labelled "Pond fact", never about the question) instead of nothing.
