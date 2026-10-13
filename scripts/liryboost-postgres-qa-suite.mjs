#!/usr/bin/env node
/** LiryBoost QA coordinator: local PostgreSQL only; never invoked in build or production. */
import {spawnSync} from "node:child_process";
import {reviewIsolatedPostgresTarget} from "../lib/liryboost/isolated-postgres-guard.ts";
const target=reviewIsolatedPostgresTarget({
 environment:process.env.LIRYBOOST_QA_ENVIRONMENT,
 explicitQaApproval:process.env.LIRYBOOST_QA_APPROVAL,
 databaseUrl:process.env.LIRYBOOST_QA_DATABASE_URL
});
if(!target.allowed){
 console.error("REFUSED: explicitly approved disposable localhost database required.");
 process.exit(2);
}
// Preflight: block the suite if local psql is missing or PostgreSQL cannot
// confirm the disposable database's identity. Does not create any objects.
const cli=spawnSync("psql",["--version"],{encoding:"utf8",timeout:5000});
if(cli.error||cli.status!==0){
 console.error("REFUSED: psql is not installed or accessible on the QA machine.");
 process.exit(2);
}
const dbCheck=spawnSync("psql",["-X","-qAt","-v","ON_ERROR_STOP=1","-d",process.env.LIRYBOOST_QA_DATABASE_URL],{
 input:"SELECT current_database();",encoding:"utf8",timeout:10000,
 env:{...process.env,PGCONNECT_TIMEOUT:"3"}
});
if(dbCheck.error||dbCheck.status!==0||dbCheck.stdout.trim()!=="liryboost_qa_disposable"){
 console.error("REFUSED: local disposable database identity not confirmed.");
 process.exit(2);
}
// Fail before any suite can TRUNCATE or DROP an already-existing QA schema.
// The test scripts own and delete their synthetic schema; never reuse one.
const schemaCheck=spawnSync("psql",["-X","-qAt","-v","ON_ERROR_STOP=1","-d",process.env.LIRYBOOST_QA_DATABASE_URL],{
 input:"SELECT count(*) FROM pg_namespace WHERE nspname = 'liryboost_qa';",
 encoding:"utf8",timeout:10000,env:{...process.env,PGCONNECT_TIMEOUT:"3"}
});
if(schemaCheck.error||schemaCheck.status!==0||schemaCheck.stdout.trim()!=="0"){
 console.error("REFUSED: existing QA schema detected or its absence could not be verified.");
 process.exit(2);
}
const suites=[
 ["C01 simultaneous claims","scripts/liryboost-postgres-concurrency-qa.mjs"],
 ["C02/C03 idempotency and consent","scripts/liryboost-postgres-idempotency-consent-qa.mjs"],
 ["C04 concurrent revocation","scripts/liryboost-postgres-revocation-race-qa.mjs"],
 ["C06 transaction rollback","scripts/liryboost-postgres-rollback-qa.mjs"],
 ["C07 privacy projection","scripts/liryboost-postgres-privacy-qa.mjs"],
 ["C07 synthetic RLS","scripts/liryboost-postgres-rls-qa.mjs"]
];
let failed=false;
for(const [name,path] of suites){
 console.log("QA:",name);
 const run=spawnSync(process.execPath,["--experimental-strip-types",path],{
  cwd:process.cwd(),env:process.env,encoding:"utf8",timeout:180000,maxBuffer:2*1024*1024
 });
 if(run.status!==0||run.error){
  console.error("FAIL:",name);
  failed=true;
  break;
 }
 console.log(run.stdout.trim());
}
if(failed){
 console.error("QA not approved. Fix failed case in isolated environment; never activate LiryBoost.");
 process.exit(1);
}
console.log("Synthetic QA suites completed. Manual Supabase RLS and production-service reviews remain required.");
