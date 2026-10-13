#!/usr/bin/env node
/** Local-only concurrency smoke test. Needs PostgreSQL's psql CLI.
 * Never run with production credentials. No dependency on Supabase.
 */
import {spawnSync} from "node:child_process";
import {reviewIsolatedPostgresTarget} from "../lib/liryboost/isolated-postgres-guard.ts";

const databaseUrl=process.env.LIRYBOOST_QA_DATABASE_URL;
const verdict=reviewIsolatedPostgresTarget({
 environment:process.env.LIRYBOOST_QA_ENVIRONMENT,
 databaseUrl,
 explicitQaApproval:process.env.LIRYBOOST_QA_APPROVAL
});
if(!verdict.allowed){console.error("Refused: PostgreSQL target is not an explicitly approved disposable local database.");process.exit(2)}
const safeUrl=new URL(databaseUrl);
const dbName=decodeURIComponent(safeUrl.pathname.slice(1));
if(dbName!=="liryboost_qa_disposable")process.exit(2);
const run=(sql)=>{
 const r=spawnSync("psql",["-X","-qAt","-v","ON_ERROR_STOP=1","-d",databaseUrl],{
   input:sql,encoding:"utf8",timeout:15000,maxBuffer:1024*1024,
   env:{...process.env,PGCONNECT_TIMEOUT:"3"}
 });
 if(r.error||r.status!==0)throw new Error("Local psql test failed; review PostgreSQL availability and QA credentials.");
 return r.stdout.trim();
};
try{
 // Transaction-scoped test objects; deliberately no public/private production schema changes.
 run("CREATE SCHEMA IF NOT EXISTS liryboost_qa; CREATE TABLE IF NOT EXISTS liryboost_qa.claim_smoke(invitee UUID PRIMARY KEY, referrer UUID NOT NULL); TRUNCATE liryboost_qa.claim_smoke;");
 const invitee="123e4567-e89b-42d3-a456-426614174001";
 const a="123e4567-e89b-42d3-a456-426614174000",b="123e4567-e89b-42d3-a456-426614174002";
 // Two contenders in one atomic insert statement; unique constraint admits only one.
 const credited=run(`WITH contenders(invitee,referrer) AS (VALUES ('${invitee}'::uuid,'${a}'::uuid),('${invitee}'::uuid,'${b}'::uuid)), attempts AS (INSERT INTO liryboost_qa.claim_smoke(invitee,referrer) SELECT * FROM contenders ON CONFLICT (invitee) DO NOTHING RETURNING invitee) SELECT count(*) FROM attempts;`);
 const finalCount=run("SELECT count(*) FROM liryboost_qa.claim_smoke;");
 if(credited!=="1"||finalCount!=="1")throw new Error("Uniqueness invariant failed");
 console.log("PASS: a single invitee has exactly one stored referrer (schema smoke test).");
 console.log("NOTE: this is NOT a concurrent-session stress test or complete attribution service.");
}finally{
 try{run("DROP SCHEMA IF EXISTS liryboost_qa CASCADE;")}catch{console.error("QA cleanup failed; inspect disposable local database.");}
}
