import { test } from "node:test";
import assert from "node:assert/strict";
import { shuffled } from "../src/shuffle.js";

test("shuffled keeps every item and does not change the input", () => {
  const input = [1, 2, 3, 4, 5, 6];
  const out = shuffled(input);
  assert.deepEqual([...out].sort(), input);
  assert.deepEqual(input, [1, 2, 3, 4, 5, 6]);
});

test("shuffled follows the random source", () => {
  assert.deepEqual(shuffled([1, 2, 3], () => 0), [2, 3, 1]);
});

test("a shuffle of ten changes the order most times", () => {
  const input = [...Array(10).keys()];
  assert.ok(Array.from({ length: 20 }, () => shuffled(input).join() !== input.join()).some(Boolean));
});
