import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { numbered, cardFor, withCards } from "../src/trivia.js";

const table = JSON.parse(readFileSync(new URL("../src/trivia.json", import.meta.url), "utf8"));

test("there is a card for each of the ten questions", () => {
  assert.deepEqual(Object.keys(table).sort((a, b) => a - b), ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
});

test("every card has text of at most 280 characters and a web source", () => {
  for (const [n, c] of Object.entries(table)) {
    assert.ok(c.text.length > 0 && c.text.length <= 280, `card ${n} length`);
    assert.match(c.source, /^https:\/\//, `card ${n} source`);
  }
});

test("TRIVIA.md has a row for every card", () => {
  const md = readFileSync(new URL("../TRIVIA.md", import.meta.url), "utf8");
  for (const n of Object.keys(table)) assert.match(md, new RegExp(`^\\| ${n} \\|`, "m"), `row ${n}`);
});

test("numbered gives each question its place in the list, from 1", () => {
  assert.deepEqual(numbered([{ text: "a" }, { text: "b" }]).map((q) => q.number), [1, 2]);
});

test("cardFor returns the card with its number, or null", () => {
  assert.deepEqual(cardFor(2, { 2: { text: "t", source: "https://x" } }), { number: 2, text: "t", source: "https://x" });
  assert.equal(cardFor(99, table), null);
});

test("the card follows the question when the order changes", () => {
  const list = numbered([{ text: "a" }, { text: "b" }, { text: "c" }]);
  const reversed = withCards([...list].reverse(), { 1: { text: "one", source: "https://x" } });
  assert.equal(reversed[2].number, 1);
  assert.equal(reversed[2].fact.text, "one");
  assert.equal(reversed[0].fact, null);
});

test("a question's own fact is kept", () => {
  const own = { text: "mine", source: null };
  assert.equal(withCards([{ number: 1, fact: own }], { 1: { text: "x", source: "https://x" } })[0].fact, own);
});
