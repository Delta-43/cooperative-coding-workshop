import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_TIME_LIMIT, MIN_TIME_LIMIT, MAX_TIME_LIMIT,
  timeLimitFor, endsAt, acceptsAnswer, timeLeftMs, answerTime, noAnswerTime,
} from "../src/timer.js";

test("constants", () => {
  assert.equal(DEFAULT_TIME_LIMIT, 20);
  assert.equal(MIN_TIME_LIMIT, 5);
  assert.equal(MAX_TIME_LIMIT, 120);
});

test("timeLimitFor defaults to 20", () => {
  assert.equal(timeLimitFor({}), 20);
  assert.equal(timeLimitFor({ timeLimit: undefined }), 20);
  assert.equal(timeLimitFor(null), 20);
});

test("timeLimitFor keeps valid integers, including the bounds", () => {
  assert.equal(timeLimitFor({ timeLimit: 5 }), 5);
  assert.equal(timeLimitFor({ timeLimit: 30 }), 30);
  assert.equal(timeLimitFor({ timeLimit: 120 }), 120);
});

test("timeLimitFor falls back to 20 for out-of-range or non-integer values", () => {
  for (const v of [4, 0, -3, 121, 1000, 12.5, NaN, Infinity, "30", null, true]) {
    assert.equal(timeLimitFor({ timeLimit: v }), 20, String(v));
  }
});

test("endsAt adds the limit in milliseconds", () => {
  assert.equal(endsAt(1_795_000_000_000, 20), 1_795_000_020_000);
  assert.equal(endsAt(0, 5), 5000);
});

test("an answer exactly at endsAt is accepted, 1 ms later is not", () => {
  const end = endsAt(1000, 20);
  assert.equal(acceptsAnswer(end - 1, end), true);
  assert.equal(acceptsAnswer(end, end), true);
  assert.equal(acceptsAnswer(end + 1, end), false);
});

test("timeLeftMs counts down and never goes negative", () => {
  assert.equal(timeLeftMs(1000, 21000), 20000);
  assert.equal(timeLeftMs(21000, 21000), 0);
  assert.equal(timeLeftMs(21001, 21000), 0);
  assert.equal(timeLeftMs(99999, 21000), 0);
});

test("answerTime is the time from opening to the answer", () => {
  assert.equal(answerTime(1000, 4210, 20), 3210);
  assert.equal(answerTime(1000, 1000, 20), 0);
});

test("answerTime clamps to 0..limit", () => {
  assert.equal(answerTime(1000, 500, 20), 0);
  assert.equal(answerTime(1000, 1000 + 20000, 20), 20000);
  assert.equal(answerTime(1000, 1000 + 25000, 20), 20000);
});

test("noAnswerTime: early reveal gives the shorter real time", () => {
  assert.equal(noAnswerTime(1000, 8000, 20), 7000);
});

test("noAnswerTime: reveal long after gives exactly the limit", () => {
  assert.equal(noAnswerTime(1000, 1000 + 20000, 20), 20000);
  assert.equal(noAnswerTime(1000, 1000 + 90000, 20), 20000);
});

test("noAnswerTime is never negative", () => {
  assert.equal(noAnswerTime(1000, 500, 20), 0);
});
