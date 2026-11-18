# Backend

Owned by Delta. A Cloudflare Worker with one Durable Object per room. It follows `../contract/messages.md`.

```
npm ci
npm test                    # the contract examples, and the unit tests once they exist
npm run dev                 # Worker on http://localhost:8787
node test/e2e.mjs rooms     # acceptance test, stage by stage: rooms, answers, all
```
