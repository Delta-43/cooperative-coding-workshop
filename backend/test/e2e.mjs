// Needs a running Worker: `npm run dev`, then `node test/e2e.mjs [http://localhost:8787]`
import assert from "node:assert/strict";
const base = process.argv[2] ?? "http://localhost:8787";
const wsBase = base.replace(/^http/, "ws");

function open(url) {
  const ws = new WebSocket(url);
  const inbox = [];
  let wake;
  ws.onmessage = (e) => { inbox.push(JSON.parse(e.data)); wake?.(); };
  const next = async (pred = () => true) => {
    for (let i = 0; i < 100; i++) {
      const at = inbox.findIndex(pred);
      if (at >= 0) return inbox.splice(at, 1)[0];
      await new Promise((r) => { wake = r; setTimeout(r, 100); });
    }
    throw new Error("timed out waiting for a message");
  };
  const ready = new Promise((r) => (ws.onopen = r));
  return { ws, ready, next, send: (m) => ws.send(JSON.stringify(m)) };
}
const latestState = async (c, pred) => c.next((m) => m.type === "state" && pred(m));

const room = await (await fetch(`${base}/api/rooms`, { method: "POST" })).json();
assert.match(room.code, /^[A-Z]{4}$/);

const host = open(`${wsBase}/api/rooms/${room.code}/ws?host=${room.hostToken}`);
await host.ready;
await latestState(host, (s) => s.phase === "lobby" && s.you.role === "host");

const ada = open(`${wsBase}/api/rooms/${room.code}/ws`);
const bo = open(`${wsBase}/api/rooms/${room.code}/ws`);
await Promise.all([ada.ready, bo.ready]);
ada.send({ type: "join", name: "Ada" });
bo.send({ type: "join", name: "ada" });
assert.equal((await bo.next((m) => m.type === "error")).code, "name_taken");
bo.send({ type: "join", name: "Bo" });
await latestState(host, (s) => s.players.length === 2);

ada.send({ type: "start" });
assert.equal((await ada.next((m) => m.type === "error")).code, "not_allowed");

host.send({ type: "start" });
const q = await latestState(ada, (s) => s.phase === "question");
assert.equal(q.reveal, null);
assert.ok(!JSON.stringify(q).includes('"correct"'), "answer must not leak before reveal");

ada.send({ type: "answer", value: 90 });
bo.send({ type: "answer", value: 50 });
await latestState(host, (s) => s.answeredCount === 2);
host.send({ type: "reveal" });
const r = await latestState(ada, (s) => s.phase === "reveal");
assert.equal(r.reveal.correct, 88);
assert.equal(r.reveal.results[0].name, "Ada");
assert.equal(r.reveal.results[0].points, 3);
assert.equal(r.reveal.results[1].points, 2);

// Reconnect with the saved playerId keeps the score.
const adaId = r.you.playerId;
const ada2 = open(`${wsBase}/api/rooms/${room.code}/ws`);
await ada2.ready;
ada2.send({ type: "join", name: "Ada", playerId: adaId });
const back = await latestState(ada2, (s) => s.you.playerId === adaId);
assert.equal(back.players.find((p) => p.id === adaId).score, 3);

for (const c of [host, ada, bo, ada2]) c.ws.close();
console.log("e2e ok, room", room.code);
