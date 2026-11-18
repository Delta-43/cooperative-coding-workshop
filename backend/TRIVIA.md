# Trivia cards

The "Did you know?" cards for the ten live questions. Each card belongs to a **question number**: its place in the `QUESTIONS` list, starting at 1. Rooms shuffle the questions, so the number never changes even when the order does. The question text and answers stay in the `QUESTIONS` secret and are not written here.

The cards live in `src/trivia.json`, keyed by number. The Worker joins them to the questions when a room is created. A question that already has its own `fact` keeps it.

## Rules for a card

- **It never contains the answer, or a number near it.** The server sends the card with the question, before anyone has answered.
- At most 280 characters, British English, one source.
- Check every claim against the source. Where sources disagree, say less.

## How a card reaches the frontend

- In the game: `question.fact` of every `state` message (`{ text, source }`), for the question on screen.
- On its own: `GET /api/trivia/<number>` returns `{ "number": 4, "text": "...", "source": "..." }`, or `404 { "error": "no_card" }`.

## Cards

| # | Topic | Card | Source | Checked |
|---|---|---|---|---|
| 1 | Buckingham Palace | Buckingham Palace has its own post office, cinema, swimming pool and doctor's surgery. Its garden is the largest private garden in London. | [en.wikipedia.org](https://en.wikipedia.org/wiki/Buckingham_Palace) | Post office, cinema, pool, surgery and the 'largest private garden in London' quoted from the article. |
| 2 | Burj Khalifa | From the top of the Burj Khalifa the sun stays in view for several minutes after it has set at ground level. Residents high up the tower wait a few extra minutes to break their Ramadan fast. | [en.wikipedia.org](https://en.wikipedia.org/wiki/Burj_Khalifa) | Sunset effect and the Ramadan fasting detail are in the article (80th and 150th floor delays). Card says 'a few extra minutes'. |
| 3 | International Space Station | People have lived aboard the International Space Station without a break since 2 November 2000. It is the longest continuous human presence in space. | [en.wikipedia.org](https://en.wikipedia.org/wiki/International_Space_Station) | Occupied continuously since 2 November 2000, article wording. |
| 4 | Venus | Venus spins the opposite way to most planets, including Earth. If you could see through its clouds, the Sun would rise in the west and set in the east. | [en.wikipedia.org](https://en.wikipedia.org/wiki/Venus) | Retrograde rotation and Sun rising in the west are in the article. Left out the length of its day and year on purpose. |
| 5 | Lake Baikal | Lake Baikal is the world's oldest lake, at 25 to 30 million years, and holds nearly a fifth of the planet's unfrozen fresh water. Its seal, the nerpa, lives nowhere else. | [en.wikipedia.org](https://en.wikipedia.org/wiki/Lake_Baikal) | 'Around 19%' of unfrozen fresh water, shortened to 'nearly a fifth'. Age 25 to 30 million years. Left out the depth. |
| 6 | Golden Gate Bridge | The US Navy wanted the Golden Gate Bridge painted in black and yellow stripes so ships could see it. Architect Irving Morrow chose International Orange, which suits the surroundings and shows up in fog. | [en.wikipedia.org](https://en.wikipedia.org/wiki/Golden_Gate_Bridge) | Navy's black and yellow suggestion and Morrow's choice are in the article. Left out span and wire counts. |
| 7 | The Moon | The Moon is drifting away from Earth by about 3.8 cm a year. Scientists measure it by bouncing laser beams off mirrors that Apollo astronauts left on the surface. | [eclipse.gsfc.nasa.gov](https://eclipse.gsfc.nasa.gov/help/ApolloLaser.html) | 3.8 cm a year from NASA Goddard's eclipse site (laser ranging to Apollo reflectors). Wikipedia's Moon page does not state it; its lunar distance page gives 3.805 cm. Left out the average distance. |
| 8 | International Space Station | The International Space Station was built in orbit, mostly from parts carried up by the Space Shuttle and fitted by astronauts using robotic arms and spacewalks. Five space agencies from fifteen countries are involved. | [en.wikipedia.org](https://en.wikipedia.org/wiki/International_Space_Station) | Assembly and 'five space programs and fifteen countries' are in the article. Left out mass and speed. |
| 9 | Golden Gate Bridge | Five foghorns were set up on the Golden Gate Bridge in 1937 and still work today. They are air-powered and switched on and off by hand. | [en.wikipedia.org](https://en.wikipedia.org/wiki/Golden_Gate_Bridge) | Foghorns 1937, air-powered, manually switched, article wording. |
| 10 | Sydney Opera House | The Sydney Opera House's roof tiles were made in Sweden by Höganäs, in two colours: glossy white and matt cream. Its Danish architect, Jørn Utzon, left Australia before it opened and never returned. | [en.wikipedia.org](https://en.wikipedia.org/wiki/Sydney_Opera_House) | Höganäs AB, 'glossy white and matte cream' and 'never to return' are in the article. Left out the tile count. |

## Add or change a card

1. Pick the question number. Write the card by the rules above and check it against the source.
2. Edit `src/trivia.json` and the row above in the same pull request.
3. `cd backend && npm test`. The tests check every card for its length, its source and its number. They cannot check for the answer, because the answers are secret: read the card against the real answer yourself.

Researched 2026-11-18.
