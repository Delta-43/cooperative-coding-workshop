import { test } from "node:test";
import assert from "node:assert/strict";
import { clearPlan, DEFAULT_IDLE_MS, DEFAULT_CLEAR_AFTER_MS } from "../src/clearing.js";

const T = 1_000_000;

test("defaults: 2 hours idle, 10 minutes after the game", () => {
  assert.equal(DEFAULT_IDLE_MS, 2 * 60 * 60 * 1000);
  assert.equal(DEFAULT_CLEAR_AFTER_MS, 10 * 60 * 1000);
});

test("an unfinished room clears after the idle time from its last activity", () => {
  const plan = clearPlan({ lastActivity: T }, {});
  assert.deepEqual(plan, { at: T + DEFAULT_IDLE_MS, reason: "idle" });
});

test("a finished room clears after the set time from when it ended, whatever happens later", () => {
  const plan = clearPlan({ overAt: T, lastActivity: T + 5 * 60 * 1000 }, {});
  assert.deepEqual(plan, { at: T + DEFAULT_CLEAR_AFTER_MS, reason: "game over" });
});

test("both times come from the settings", () => {
  assert.equal(clearPlan({ lastActivity: T }, { IDLE_CLEAR_MS: "3000" }).at, T + 3000);
  assert.equal(clearPlan({ overAt: T }, { CLEAR_AFTER_MS: "4000" }).at, T + 4000);
});

test("a bad or missing setting falls back to the default", () => {
  assert.equal(clearPlan({ lastActivity: T }, { IDLE_CLEAR_MS: "soon" }).at, T + DEFAULT_IDLE_MS);
  assert.equal(clearPlan({ lastActivity: T }, { IDLE_CLEAR_MS: "-5" }).at, T + DEFAULT_IDLE_MS);
  assert.equal(clearPlan({ overAt: T }, { CLEAR_AFTER_MS: "0" }).at, T + DEFAULT_CLEAR_AFTER_MS);
});

test("a room from before this change (no lastActivity) is due at once", () => {
  assert.ok(clearPlan({}, {}).at <= DEFAULT_IDLE_MS);
});
