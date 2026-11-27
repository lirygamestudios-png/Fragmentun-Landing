import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const source = readFileSync(
  new URL("../app/api/integrations/mole/drafts/route.ts", import.meta.url),
  "utf8"
);

test("P10J UUID validator accepts standard PATCH identifiers", () => {
  const match = source.match(/const uuid=(\/\^[^\r\n]+?\$\/i);/);
  assert.ok(match, "UUID validator missing");

  const uuid = new RegExp(match[1].slice(1, -2), "i");

  assert.equal(
    uuid.test("55fed5e7-2258-4ea0-905d-2b5ac1542ae7"),
    true
  );

  assert.equal(uuid.test("invalid-uuid"), false);
  assert.equal(
    uuid.test("55fed5e7-2258-4ea0-905d-2b5ac1542ae7-extra"),
    false
  );

  assert.equal(
    uuid.test("55fed5e7-2258-4ea0-905d-2b5ac1542ae"),
    false
  );
});

test("P10J PATCH requires UUID and rejects publication fields", () => {
  assert.match(source, /update&&/);
  assert.match(source, /uuid\.test\(data\.id\)/);
  assert.match(source, /Object\.keys\(data\)\.some/);
  assert.match(source, /const allowed=new Set/);
  assert.match(source, /export async function PATCH/);
});