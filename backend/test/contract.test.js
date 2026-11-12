import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import Ajv from "ajv/dist/2020.js";

const dir = new URL("../../contract/", import.meta.url);
const schema = JSON.parse(readFileSync(new URL("schema.json", dir), "utf8"));
const validate = new Ajv({ strict: false }).compile(schema);

for (const file of readdirSync(new URL("examples/", dir))) {
  test(`contract example ${file} matches the schema`, () => {
    const message = JSON.parse(readFileSync(new URL(`examples/${file}`, dir), "utf8"));
    assert.ok(validate(message), JSON.stringify(validate.errors));
  });
}

test("the schema rejects an unknown message type", () => {
  assert.equal(validate({ type: "dance" }), false);
});
