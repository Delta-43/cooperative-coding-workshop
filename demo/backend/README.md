# Backend

A Cloudflare Worker with one Durable Object (`Room`) per game. It follows `../contract/messages.md`.

```
npm install
npm test          # scoring rules and contract examples
npm run dev       # Worker on http://localhost:8787
node test/e2e.mjs # plays a full round against the running Worker
```

Questions: `src/questions.sample.json` is a small public sample. The real set is stored as a Worker secret named `QUESTIONS` (a JSON array of `{ text, unit, answer }`), so the answers are not in this repository. For local use, put `QUESTIONS=...` in `.dev.vars`.
