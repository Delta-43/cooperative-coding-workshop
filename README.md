# Co-operative Coding Workshop

**Two people. Two AI agents. One repo.** A follow-up to the [Guided Coding Workshop](https://github.com/Delta-43/guided-coding-workshop). This time I show how a small team works together with AI agents: roles, a plan, a shared contract, issues, branches, pull requests, CI and sign-off.

It is a showcase, not a hands-on session. The Volunteer and I build on stage, each driving our own Claude Code, and the room watches, predicts, votes and plays the result on their phones.

**When:** Wednesday 18 November 2026, 16:30 to 19:30, in the Auditorium at 42 Warsaw.

**Play the game:** [delta-43.github.io/cooperative-coding-workshop](https://delta-43.github.io/cooperative-coding-workshop/). Open `#/host` on a big screen to host a room, and scan the QR code with your phone to join.

The demo project is **Closest Number**, a live quiz for a room. Players answer number questions on their phones, and the closest guess wins the round. Equal distance goes to the earlier answer. The frontend runs on GitHub Pages, and the backend is a Cloudflare Worker with one Durable Object per room.

## What's in here

```
PROJECT-SPEC.pdf       The team brief: get-ready guide, roles, architecture, contract, phases and issues, rules
POSTER.pdf             Event poster (A4)
SLIDES.html            Shortcut: opens the slide deck
AGENTS.md              Short, hand-written instructions both agents read (CLAUDE.md imports it)
DECISIONS.md           One line per decision
contract/              The WebSocket messages both sides share: messages.md, schema.json, examples
backend/               The Cloudflare Worker and the room logic (Delta)
frontend/              Host screen and phone screens (Volunteer)
materials/
└── slides/            Slide deck: open index.html in a browser
.github/workflows/     CI on every pull request, and the GitHub Pages publish
```

## The workflow in one picture

1. **Team:** state the roles, and who owns which folder.
2. **Plan:** the architecture and the contract. The contract merges first.
3. **Phases:** each phase is a milestone with a sign-off issue that only a human closes.
4. **Issues:** each one has "done when", an exact verify command and a "do not touch" line.
5. **Branches and pull requests:** one branch per issue. CI must pass, the other person approves, and the author explains the PR with the agent closed.

Skills join at named moments, each doing one job and reporting: API Contract Review, Clean Code, Impeccable, better-ui, improve-animations and Apple HIG.

## Presenting the slides

Open `SLIDES.html` (or `materials/slides/index.html`) in a browser. It needs an internet connection for the fonts. There's no build step.

| Key | Action |
|---|---|
| → / Space / Page Down | Next slide |
| ← / Page Up | Previous slide |
| Home / End | First / last slide |
| F | Fullscreen |

The URL keeps the slide number (`index.html#8`), so reloading keeps your place.

## Run the game yourself

```sh
cd backend && npm ci && npm test        # Worker tests and contract examples
cd frontend && npm ci && npm run dev    # http://localhost:5173
```

See `backend/README.md` and `frontend/README.md` for details. The host keys are Space (main action), Backspace (back) and Esc (players).

## Credits

- The duck illustrations were made for this workshop with OpenAI's image generation, through the Codex CLI.
- Research behind the workflow: Anthropic's Claude Code documentation, the Model Context Protocol and Agent Skills specifications, Simon Willison's "lethal trifecta", and the Linux kernel's policy on generated content. The project brief lists the details.
- Typefaces: [Anton](https://fonts.google.com/specimen/Anton) and [JetBrains Mono](https://www.jetbrains.com/lp/mono/) (SIL Open Font License), and [Switzer](https://www.fontshare.com/fonts/switzer) (ITF Free Font License).

## License

- **Workshop materials** (everything except `backend/`, `frontend/` and `contract/`): [CC BY-NC 4.0](LICENSE). You're welcome to reuse and adapt them for non-commercial workshops, with credit.
- **Code in `backend/`, `frontend/` and `contract/`**: MIT, see the `LICENSE` file in each folder.

Part of [Delta-43/workshops](https://github.com/Delta-43/workshops).
