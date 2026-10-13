#!/usr/bin/env node
/** LiryBoost C06 — Verify transaction rollback on injected failure, local QA only. */
import {spawnSync} from "node:child_process";
import {reviewIsolatedPostgresTarget} from "../lib/liryboost/isolated-postgres-guard.ts";
const url=process.env.LIRYBOOST_QA_DATABASE_URL;
if(!reviewIsolatedPostgresTarget({
 environment:process.env.LIRYBOOST_QA_ENVIRONMENT,
 explicitQaApproval:process.env.LIRYBOOST_QA_APPROVAL,
 databaseUrl:url
}).allowed){console.error("REFUSED: disposable local PostgreSQL only");process.exit(2)}
const run=(sql,{expectFailure=false}={})=>{
 const p=spawnSync("psql",["-X","-qAt","-v","ON_ERROR_STOP=1","-d",url],{
 input:sql,encoding:"utf8",timeout:15000,env:{...process.env,PGCONNECT_TIMEOUT:"3"}
 });
 if(p.error||((p.status!==0)!==expectFailure))throw Error("Unexpected QA SQL result");
 return p.stdout.trim();
};
const existingQaSchema=run("SELECT count(*) FROM pg_namespace WHERE nspname='liryboost_qa';");
if(existingQaSchema!=="0"){console.error("REFUSED: existing QA schema.");process.exit(2)}
let qaSchemaCreated=false;
try{
 run("CREATE SCHEMA liryboost_qa;");
 qaSchemaCreated=true;
 run(` CREATE TABLE liryboost_qa.events(event_id uuid PRIMARY KEY,invitee uuid NOT NULL);
 CREATE TABLE liryboost_qa.counters(invitee uuid PRIMARY KEY,total int NOT NULL CHECK(total>=0));`);
 const invitee="123e4567-e89b-42d3-a456-426614174001";
 const event="123e4567-e89b-42d3-a456-426614174004";
 run(`BEGIN;
 INSERT INTO liryboost_qa.events VALUES ('${event}','${invitee}');
 INSERT INTO liryboost_qa.counters VALUES ('${invitee}',1);
 SELECT 1/0;
 COMMIT;`,{expectFailure:true});
 const state=run("SELECT (SELECT count(*) FROM liryboost_qa.events)::text || '|' || (SELECT count(*) FROM liryboost_qa.counters)::text;");
 if(state!=="0|0")throw Error("Rollback failed: orphan event or counter");
 run(`BEGIN;
 INSERT INTO liryboost_qa.events VALUES ('${event}','${invitee}');
 INSERT INTO liryboost_qa.counters VALUES ('${invitee}',1);
 COMMIT;`);
 const success=run("SELECT (SELECT count(*) FROM liryboost_qa.events)::text || '|' || (SELECT sum(total) FROM liryboost_qa.counters)::text;");
 if(success!=="1|1")throw Error("Valid transaction inconsistent");
 console.log("PASS: injected SQL error rolls back event and counter; valid retry commits once.");
 console.log("LIMITATION: synthetic local schema; no real LiryBoost service or network-failure simulation.");
}finally{
 if(qaSchemaCreated){try{run("DROP SCHEMA IF EXISTS liryboost_qa CASCADE;")}catch{console.error("QA cleanup failed; inspect disposable local database")}}
}
