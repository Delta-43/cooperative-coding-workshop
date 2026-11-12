import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreRound, relativeError } from "../src/scoring.js";

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

test("a tie shares the rank and the next rank is skipped", () => {
  const results = scoreRound(
    [
      { playerId: "a", name: "A", value: 90 },
      { playerId: "b", name: "B", value: 110 },
      { playerId: "c", name: "C", value: 120 },
      { playerId: "d", name: "D", value: 130 },
    ],
    100,
  );
  assert.deepEqual(results.map((r) => r.rank), [1, 1, 3, 4]);
  assert.deepEqual(results.map((r) => r.points), [3, 3, 1, 0]);
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
  assert.deepEqual(results[1], { playerId: "a", name: "A", value: null, error: null, rank: null, points: 0 });
});
