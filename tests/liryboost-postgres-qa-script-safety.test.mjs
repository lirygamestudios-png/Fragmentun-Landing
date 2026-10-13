import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const scripts=[
 "liryboost-postgres-qa.mjs",
 "liryboost-postgres-concurrency-qa.mjs",
 "liryboost-postgres-idempotency-consent-qa.mjs",
 "liryboost-postgres-revocation-race-qa.mjs",
 "liryboost-postgres-rollback-qa.mjs",
 "liryboost-postgres-privacy-qa.mjs",
 "liryboost-postgres-rls-qa.mjs"
];
for(const script of scripts){
 test(`isolated QA ${script} refuses schema reuse and guards cleanup`,()=>{
  const source=readFileSync(new URL(`../scripts/${script}`,import.meta.url),"utf8");
  assert.match(source,/reviewIsolatedPostgresTarget/);
  assert.match(source,/SELECT count\(\*\) FROM pg_namespace WHERE nspname='liryboost_qa'/);
  assert.doesNotMatch(source,/CREATE SCHEMA IF NOT EXISTS liryboost_qa/);
  assert.match(source,/CREATE SCHEMA liryboost_qa/);
  assert.match(source,/DROP SCHEMA (?:IF EXISTS )?liryboost_qa/);
  assert.match(source,/if\((?:qaSchemaCreated|created)\)/);
 });
}

test("synthetic RLS QA refuses pre-existing roles",()=>{
 const source=readFileSync(new URL("../scripts/liryboost-postgres-rls-qa.mjs",import.meta.url),"utf8");
 assert.match(source,/preexistingQaRoles/);
 assert.match(source,/pg_roles/);
 assert.match(source,/existing QA roles/);
});

test("RLS QA cleans up only roles created by its own execution",()=>{
 const source=readFileSync(new URL("../scripts/liryboost-postgres-rls-qa.mjs",import.meta.url),"utf8");
 assert.match(source,/qaAnonCreated=true/);
 assert.match(source,/qaMemberCreated=true/);
 assert.match(source,/if\(qaMemberCreated\)/);
 assert.match(source,/if\(qaAnonCreated\)/);
});
