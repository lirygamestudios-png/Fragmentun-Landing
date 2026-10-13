import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
const path="scripts/liryboost-postgres-qa-suite.mjs";
test("QA rejects missing explicit local approval without contacting PostgreSQL",()=>{
 const r=spawnSync(process.execPath,["--experimental-strip-types",path],{
  encoding:"utf8",timeout:10000,
  env:{...process.env,LIRYBOOST_QA_ENVIRONMENT:"production",LIRYBOOST_QA_APPROVAL:"NO",
   LIRYBOOST_QA_DATABASE_URL:"postgresql://qa:test@127.0.0.1:5432/liryboost_qa_disposable"}
 });
 assert.equal(r.status,2);
 assert.match(r.stderr,/REFUSED/);
});
test("QA rejects external database before spawning psql",()=>{
 const r=spawnSync(process.execPath,["--experimental-strip-types",path],{
  encoding:"utf8",timeout:10000,
  env:{...process.env,LIRYBOOST_QA_ENVIRONMENT:"isolated_test",LIRYBOOST_QA_APPROVAL:"LIRYBOOST_LOCAL_QA_ONLY",
   LIRYBOOST_QA_DATABASE_URL:"postgresql://qa:test@external.example.com:5432/liryboost_qa_disposable"}
 });
 assert.equal(r.status,2);
 assert.match(r.stderr,/REFUSED/);
});
