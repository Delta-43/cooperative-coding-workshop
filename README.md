# Guess Closer! (live build)

The repository that Delta and the Volunteer build on stage at the [Co-operative Coding Workshop](https://github.com/Delta-43/cooperative-coding-workshop): two people, two AI agents, one repo. The issues, branches, pull requests and CI runs here are from the day.

Guess Closer! is a live quiz for a room. Players guess numbers on their phones, and the closest guess wins.

- `AGENTS.md`: the short instructions both agents read.
- `PLAN.md`: the goal, the team, the phases and the tasks. The humans own it.
- `DECISIONS.md`: one line per decision.
- `contract/`, `backend/`, `frontend/`: filled in during the workshop, contract first.
- `prompts/`: the prompts each person gives their agent: `frontend-start.md` for the Volunteer, `backend-prompts.md` for Delta.

The finished game is in the workshop repository, in [`demo/`](https://github.com/Delta-43/cooperative-coding-workshop/tree/main/demo).

## Rules on `main`

A pull request is required, CI must pass, and the other person approves. Nobody pushes straight to `main`.

## License

MIT, see [`LICENSE`](LICENSE).
