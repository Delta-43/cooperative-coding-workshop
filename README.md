# Co-operative Coding Workshop

[![Live demo](https://img.shields.io/badge/demo-play%20Guess%20Closer!-1f6feb?style=flat)](https://delta-43.github.io/cooperative-coding-workshop/)
[![CI](https://img.shields.io/github/actions/workflow/status/Delta-43/cooperative-coding-workshop/ci.yml?branch=main&label=CI)](https://github.com/Delta-43/cooperative-coding-workshop/actions/workflows/ci.yml)
[![Materials: CC BY-NC 4.0](https://img.shields.io/badge/materials-CC%20BY--NC%204.0-lightgrey)](LICENSE)
[![Code: MIT](https://img.shields.io/badge/code-MIT-green)](demo/LICENSE)
![Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-d97757)
![Cloudflare Workers](https://img.shields.io/badge/backend-Cloudflare%20Workers-f38020)
![React](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-087ea4)

**Two people. Two AI agents. One repo.** A follow-up to the [Guided Coding Workshop](https://github.com/Delta-43/guided-coding-workshop). This time I show how a small team works together with AI agents: roles, a plan, a shared contract, issues, branches, pull requests, CI and sign-off.

It was a showcase, not a hands-on session. The Volunteer and I built on stage, each driving our own Claude Code, and the room watched, predicted, voted and played the result on their phones.

**When and where:** Wednesday 18 November 2026, 16:30 to 19:30, in the Social Space at 42 Warsaw.

**Play the game:** [delta-43.github.io/cooperative-coding-workshop](https://delta-43.github.io/cooperative-coding-workshop/). Open `#/host` on a big screen to host a room, and scan the QR code with your phone to join.

The demo project is **Guess Closer!**, a live quiz for a room. Players answer number questions on their phones, and the closest guess wins the round. Equal guesses go to the earlier answer. The frontend runs on GitHub Pages, and the backend is a Cloudflare Worker with one Durable Object per room.

## What's in here

```
PROJECT-SPEC.pdf       The team guide: set up each computer, the first conversation, the plan, the repo, CI, the working loop
POSTER.pdf             Event poster (A4)
SLIDES.html            Shortcut: opens the slide deck
materials/
├── PROJECT-SPEC.pdf   A copy of the team guide
└── slides/            Slide deck: open index.html in a browser. The duck illustrations are in assets/
live/                  The game built on stage during the workshop, kept as an example: screenshots, and a Dockerfile to run it
                       (it was the repo delta-workshops/guess-closer; its history is kept)
demo/                  The finished Guess Closer! game: contract, backend, frontend, plan, decisions and design
.github/workflows/     CI on every pull request, the GitHub Pages publish, and the sync with Delta-43/workshops
```

## The workflow in one picture

1. **Team:** state the roles, and who owns which folder.
2. **Plan:** the architecture and the contract. The contract merges first.
3. **Phases:** each phase is a milestone with a sign-off issue that only a human closes.
4. **Issues:** each one has "done when", an exact verify command and a "do not touch" line.
5. **Branches and pull requests:** one branch per issue. CI must pass, the other person approves, and the author explains the PR with the agent closed.

Skills join at named moments, each doing one job and reporting: API Contract Review, Clean Code, Impeccable, better-ui, improve-animations and apple-design.

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

The finished game (`demo/`) is live at the address above. Both versions can run on your own computer:

```sh
cd demo/backend && npm ci && npm test        # Worker tests and contract examples
cd demo/frontend && npm ci && npm run dev    # http://localhost:5173
```

See `demo/README.md` for details. The host keys are Space (main action), Backspace (back) and Esc (players).

The game as it was built on stage (`live/`) runs in one container: `cd live && docker build -t guess-closer . && docker run -p 8787:8787 guess-closer`, then open <http://localhost:8787/#/host>. Its [README](live/README.md) has screenshots of what was built.

## Skills used in the workshop

Each skill did one job at one named moment and reported; a human decided what to change. Read each `SKILL.md` before you install it: a skill is instructions your agent will follow. The exact install commands, pinned to a commit, are in [`live/prompts/`](live/prompts/).

| Skill | By | Used for | Licence |
|---|---|---|---|
| [API Contract Review](https://github.com/Mozurok/fhorja.dev/blob/main/.claude/skills/api-contract-review/SKILL.md) | Mozurok (Fhorja) | Delta, on stage: the contract pull request, before approval | MIT |
| [Clean Code](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/skills/development/clean-code/SKILL.md) | davila7 (Claude Code Templates) | Delta, on stage: each backend pull request, before opening it | MIT |
| [Impeccable](https://github.com/pbakaus/impeccable) | Paul Bakaus | The Volunteer: design direction and critique | Apache-2.0 |
| [better-ui](https://github.com/jakubkrehel/skills/tree/main/skills/better-ui) | Jakub Krehel | The Volunteer: surfaces, icons and details | MIT |
| [improve-animations](https://github.com/emilkowalski/skills/tree/main/skills/improve-animations) | Emil Kowalski | The leaderboard motion | MIT |
| [apple-design](https://github.com/emilkowalski/skills/tree/main/skills/apple-design) | Emil Kowalski | Touch, motion and type on the phone screens | MIT |

Thank you to their authors.

## Credits

- The duck illustrations were made for this workshop with OpenAI's image generation, through the Codex CLI.
- Research behind the workflow: Anthropic's Claude Code documentation, the Model Context Protocol and Agent Skills specifications, Simon Willison's "lethal trifecta", and the Linux kernel's policy on generated content. The team guide lists the details.
- Typefaces: [Anton](https://fonts.google.com/specimen/Anton) and [JetBrains Mono](https://www.jetbrains.com/lp/mono/) (SIL Open Font License), and [Switzer](https://www.fontshare.com/fonts/switzer) (ITF Free Font License).

## License

- **Workshop materials** (everything except `live/` and `demo/`): [CC BY-NC 4.0](LICENSE). You're welcome to reuse and adapt them for non-commercial workshops, with credit.
- **Code in `demo/`**: [MIT](demo/LICENSE).
- **Code in `live/`**: MIT, see [`live/LICENSE`](live/LICENSE).

Part of [Delta-43/workshops](https://github.com/Delta-43/workshops).
