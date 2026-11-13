import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreRound, relativeError, finalOrder } from "../src/scoring.js";

test("relative error is distance divided by the true answer", () => {
  assert.equal(relativeError(80, 100), 0.2);
  assert.equal(relativeError(150, 100), 0.5);
});

test("relative error beats plain distance for big answers", () => {
  const results = scoreRound(
    [
      { playerId: "a", name: "A", value: 11 }, // off by 1, error 0.1
      { playerId: "b", name: "B", value: 1000500 }, // off by 500, error 0.0005
    ],
    1000000,
  );
  assert.equal(results[0].playerId, "b");
});

test("points are 3, 2, 1 and then 0", () => {
  const results = scoreRound(
    [1, 2, 3, 4].map((n) => ({ playerId: "p" + n, name: "P" + n, value: 100 + n })),
    100,
  );
  assert.deepEqual(results.map((r) => r.points), [3, 2, 1, 0]);
  assert.deepEqual(results.map((r) => r.rank), [1, 2, 3, 4]);
});

test("equal error: the earlier answer ranks higher, and ranks are never shared", () => {
  const results = scoreRound(
    [
      { playerId: "a", name: "A", value: 90, time: 9000 },
      { playerId: "b", name: "B", value: 110, time: 5000 },
      { playerId: "c", name: "C", value: 120, time: 1000 },
      { playerId: "d", name: "D", value: 130, time: 2000 },
    ],
    100,
  );
  assert.deepEqual(results.map((r) => r.playerId), ["b", "a", "c", "d"]);
  assert.deepEqual(results.map((r) => r.rank), [1, 2, 3, 4]);
  assert.deepEqual(results.map((r) => r.points), [3, 2, 1, 0]);
  assert.deepEqual(results.map((r) => r.time), [5000, 9000, 1000, 2000]);
});

test("a closer answer beats a faster one", () => {
  const results = scoreRound(
    [
      { playerId: "fast", name: "Fast", value: 120, time: 500 },
      { playerId: "slow", name: "Slow", value: 101, time: 20000 },
    ],
    100,
  );
  assert.equal(results[0].playerId, "slow");
});

test("final order: more points first, then the lower total time", () => {
  const order = finalOrder([
    { id: "a", score: 6, time: 40000 },
    { id: "b", score: 9, time: 90000 },
    { id: "c", score: 6, time: 30000 },
  ]);
  assert.deepEqual(order.map((p) => p.id), ["b", "c", "a"]);
});

test("players with no answer score 0 and have no rank", () => {
  const results = scoreRound(
    [
      { playerId: "a", name: "A", value: null },
      { playerId: "b", name: "B", value: 5 },
    ],
    5,
  );
  assert.equal(results[0].playerId, "b");
  assert.deepEqual(results[1], { playerId: "a", name: "A", value: null, error: null, time: null, rank: null, points: 0 });
});
