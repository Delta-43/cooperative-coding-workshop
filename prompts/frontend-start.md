# Starting prompt: frontend

For the Volunteer. Paste this into your agent as the first message of the session, in your own clone of this repo. Change anything you like: the design is yours.

```text
You are helping me build the frontend of Guess Closer!, a live quiz game for a room.
I own the frontend/ folder. My teammate owns backend/. We share contract/.

Before you write anything:
1. Read AGENTS.md, PLAN.md and DECISIONS.md.
2. Read contract/messages.md and the examples in contract/examples/. The contract is the
   only thing we share with the backend. Do not guess a message that is not in it.
3. Tell me in a few lines what the game does and which screens it needs. Then ask me your
   questions about the design. Do not write code until I have answered.

What I want:
- Two surfaces. A host screen for a projector, and a phone screen for each player.
- The host creates a room and shows a join code and a QR code. Players join with a
  nickname, answer number questions, and see how close they were. The host reveals each
  answer on the big screen and shows a final board. The host sends `reveal` and then `show`
  when the answer is on the big screen: phones get their result only after `show`.
- The look and the feel are open. Propose a direction first, with one or two alternatives,
  and let me choose. Surprise me, but keep it readable from the back of a room and easy
  to use with one thumb.

Rules:
- Work only in frontend/. Never edit backend/ or contract/. If the contract seems wrong
  or incomplete, stop and tell me: that is a conversation with my teammate, not a code change.
- React, TypeScript and Vite. `npm run lint` and `npm run build` must pass, because CI runs them.
- The site is published to GitHub Pages under a sub-path (https://delta-workshops.github.io/guess-closer/).
  Set this up in the first frontend change, without asking me: `base: process.env.BASE_PATH ?? '/'`
  in vite.config.ts, hash routes (#/host and the plain address for joining), and no absolute asset
  paths. The QR code encodes location.origin + location.pathname. Read the Pages rule in AGENTS.md.
- The backend address comes from VITE_BACKEND_URL. Use the test Worker in AGENTS.md by default.
- One issue at a time, on a branch named after it. Keep each pull request small enough to
  read in five minutes. Run the issue's verify command and show me the output before you
  say it is done.
- Never read or print secrets, tokens or .env files. Never deploy.

Start with step 1.
```

## After the first answer

- Pick the direction, then give the agent one issue at a time: `F1` join screen (#6), `F2` answer screen (#7), `F3` host board (#8), `F4` leaderboard motion (#9). Start after the contract pull request (PR 15) has merged and `git pull` has brought it into `main`. Put `Closes #N` in each pull request's description.
- Each issue has a "done when", a verify command and a "do not touch" line. Paste the issue, or let the agent read it with `gh issue view`.
- Run a design or interface review skill on each pull request, and read what it reports.
