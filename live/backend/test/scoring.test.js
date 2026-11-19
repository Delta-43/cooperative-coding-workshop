import { test } from "node:test";
import assert from "node:assert/strict";
import { relativeError, scoreRound, finalOrder } from "../src/scoring.js";

const a = (playerId, value, time) => ({ playerId, name: playerId.toUpperCase(), value, time });

test("relative error is distance divided by the answer", () => {
  assert.equal(relativeError(80, 100), 0.2);
  assert.equal(relativeError(120, 100), 0.2);
  assert.equal(relativeError(88, 88), 0);
});

test("relative error does not depend on the size of the answer", () => {
  assert.equal(relativeError(1100, 1000), relativeError(110, 100));
  assert.equal(relativeError(1_100_000, 1_000_000), relativeError(11, 10));
});

test("points are 3, 2, 1 and then 0", () => {
  const r = scoreRound([a("a", 10, 1), a("b", 20, 1), a("c", 30, 1), a("d", 40, 1), a("e", 50, 1)], 10);
  assert.deepEqual(r.map((x) => x.points), [3, 2, 1, 0, 0]);
  assert.deepEqual(r.map((x) => x.rank), [1, 2, 3, 4, 5]);
});

test("equal error: the earlier answer ranks higher and ranks are never shared", () => {
  const r = scoreRound([a("late", 90, 5000), a("early", 110, 2000)], 100);
  assert.deepEqual(r.map((x) => x.playerId), ["early", "late"]);
  assert.deepEqual(r.map((x) => x.rank), [1, 2]);
});

test("a closer answer beats a faster one", () => {
  const r = scoreRound([a("fast", 50, 100), a("close", 99, 9000)], 100);
  assert.equal(r[0].playerId, "close");
});

test("no answer: last, no rank, no points", () => {
  const r = scoreRound([a("none", null, null), a("some", 5, 100)], 10);
  assert.equal(r[0].playerId, "some");
  assert.deepEqual(r[1], { playerId: "none", name: "NONE", value: null, error: null, time: null, rank: null, points: 0 });
});

test("final order: more points first, then the lower total time", () => {
  const out = finalOrder([
    { id: "a", score: 3, time: 9000 }, { id: "b", score: 5, time: 20000 }, { id: "c", score: 3, time: 4000 },
  ]);
  assert.deepEqual(out.map((p) => p.id), ["b", "c", "a"]);
});
