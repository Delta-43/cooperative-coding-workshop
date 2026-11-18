# Handoff

Written 2026-11-18, at the end of the workshop day, for Delta to continue alone. Delete this file when you have finished the work below.

## State

- **Backend: done and live.** `https://guess-closer-live.delta-43.workers.dev`, version `6387acfd-08c4-41d0-9b5c-6a847d30f878`, deployed from `main` at `d8c7ec1`. 48 unit tests; `node test/e2e.mjs all` passes against it. It follows `contract/messages.md`: answer timer, "Did you know?" cards by question number, shuffled questions, rooms that clear themselves.
- **Contract: done and merged.** Includes "The timer" and "Closing".
- **Frontend: built and merged** (join, answer, host board, leaderboard, water and birds), published to `https://delta-workshops.github.io/guess-closer/`. Not played on real phones or a projector yet.
- The workshop's last game ran on an older build. Check which frontend build Pages is serving before you rely on it.

## Open work

| Issue | What | Notes |
|---|---|---|
| #44 F8 | Host screen: the main button is pushed under the progress bar | Work in progress on branch `f8-host-reveal-layout` (commit `c0710c9`, pushed, no PR). See below |
| #38 F5 | `frontend/src/contract.ts` is behind the contract | Add `question.number`; make the timer fields and `fact` required. Decide whether the "Pond fact" fallback stays when `fact` is null |
| #39 F6 | Phones retry for ever after the room clears | Treat close code `1000` as final. Needs nothing else now: the contract section is merged |
| #40 T1 | CI check for drift between the frontend types and the contract | Needs F5 |
| #11 I2 | One full game on real phones | The final gate. Checklist is in a comment on the issue |
| #10 I1 | Point the frontend at the Worker | Done in practice (the default address is the live Worker). Check and close |
| #12 to #14 | Phase sign-offs | Yours to close after checking each "done when" |

## F8, where I stopped

The host screen is now one fixed-height column: header and footer keep their size, the card takes the rest, and sizes inside the card follow its height (`cqh` units). `overflow: clip` stops focus from scrolling the screen sideways. The results list shows 4 rows on short screens.

Checked at 1920x999, 1366x768 and 1280x720 on the question, reveal, show and leaderboard steps: the button was always above the progress bar. Still to do:
1. A last full re-run of those checks, with long waits (the card slides for about 3 seconds).
2. Look at the final board at those sizes.
3. One line in `DECISIONS.md`, then a pull request that closes #44.

My checking scripts (Playwright, driving a host and a bot player) were in a temporary folder on the workshop machine and are not in the repo. To redo the check: open `#/host`, open a room, join a bot from `?room=CODE`, press Space through the steps, and confirm the main button's bottom edge is above the progress bar's top edge. Drive the host with the Space key, not by clicking: automated clicks scroll the page and give false results.

## Things to know

- **Questions are secret.** The real ten are in the `QUESTIONS` secret on the Worker. Their cards are in `backend/src/trivia.json` and `backend/TRIVIA.md`, by question number. Read each card against the real answer before you change the set; the tests cannot see the answers.
- **Deploy by hand:** `cd backend && npx wrangler deploy`, then `node test/e2e.mjs all https://guess-closer-live.delta-43.workers.dev`. Never read or commit secrets.
- **Rules:** `AGENTS.md` still applies. `main` needs a review. The contract changes first, in its own pull request. A decision goes into `DECISIONS.md` as one line, in the same pull request.
- `prompts/backend-prompts.md` was updated for B4 to B7 but no fresh agent has re-run it. Run the whole sequence once in a scratch branch before using it on stage.
- Known small things: a room that clears for being idle refuses joins at once, but the host's socket takes about 10 seconds to finish closing. A player can join mid-game with a total time of 0, which helps on a tied score; the contract allows it.
