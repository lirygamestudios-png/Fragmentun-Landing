#!/usr/bin/env node
/** LiryBoost: isolated local PostgreSQL QA for idempotency and consent revocation.
 * Not a production implementation and never connected to Supabase.
 */
import {spawnSync} from "node:child_process";
import {reviewIsolatedPostgresTarget} from "../lib/liryboost/isolated-postgres-guard.ts";
const databaseUrl=process.env.LIRYBOOST_QA_DATABASE_URL;
if(!reviewIsolatedPostgresTarget({
 environment:process.env.LIRYBOOST_QA_ENVIRONMENT,
 explicitQaApproval:process.env.LIRYBOOST_QA_APPROVAL,
 databaseUrl
}).allowed){console.error("REFUSED: requires disposable local PostgreSQL database.");process.exit(2)}
function query(sql){
 const r=spawnSync("psql",["-X","-qAt","-v","ON_ERROR_STOP=1","-d",databaseUrl],{
  input:sql,encoding:"utf8",timeout:15000,maxBuffer:1024*1024,
  env:{...process.env,PGCONNECT_TIMEOUT:"3"}
 });
 if(r.error||r.status!==0)throw Error("Local PostgreSQL QA failed");
 return r.stdout.trim();
}
const runId="123e4567-e89b-42d3-a456-426614174009";
const invitee="123e4567-e89b-42d3-a456-426614174001";
const referrer="123e4567-e89b-42d3-a456-426614174000";
try{
 query(`CREATE SCHEMA IF NOT EXISTS liryboost_qa;
 CREATE TABLE liryboost_qa.idempotent_events(operation_id uuid PRIMARY KEY, payload_digest text NOT NULL);
 CREATE TABLE liryboost_qa.consent_events(user_id uuid NOT NULL, event_no int NOT NULL, status text NOT NULL CHECK(status IN ('accepted','revoked')), PRIMARY KEY(user_id,event_no));
 CREATE TABLE liryboost_qa.credits(invitee uuid PRIMARY KEY, referrer uuid NOT NULL);
 INSERT INTO liryboost_qa.consent_events VALUES ('${invitee}',1,'accepted');`);
 const once=query(`INSERT INTO liryboost_qa.idempotent_events VALUES ('${runId}','payload-v1') ON CONFLICT DO NOTHING RETURNING operation_id;`);
 const replay=query(`INSERT INTO liryboost_qa.idempotent_events VALUES ('${runId}','payload-v1') ON CONFLICT DO NOTHING RETURNING operation_id;`);
 const count=query("SELECT count(*) FROM liryboost_qa.idempotent_events;");
 if(once!==runId||replay!==""||count!=="1")throw Error("Idempotency replay invariant failed");
 const clash=query(`SELECT CASE WHEN EXISTS(SELECT 1 FROM liryboost_qa.idempotent_events WHERE operation_id='${runId}' AND payload_digest<>'payload-v2') THEN 'conflict' ELSE 'safe' END;`);
 if(clash!=="conflict")throw Error("Changed payload conflict must be rejected");
 query(`INSERT INTO liryboost_qa.consent_events VALUES ('${invitee}',2,'revoked');`);
 const revocation=query(`INSERT INTO liryboost_qa.credits(invitee,referrer)
 SELECT '${invitee}', '${referrer}' WHERE EXISTS (
 SELECT 1 FROM liryboost_qa.consent_events WHERE user_id='${invitee}'
 GROUP BY user_id HAVING (array_agg(status ORDER BY event_no DESC))[1]='accepted')
 ON CONFLICT DO NOTHING RETURNING invitee;`);
 if(revocation!==""||query("SELECT count(*) FROM liryboost_qa.credits;")!=="0")
  throw Error("Revoked invitee received credit");
 console.log("PASS: idempotent replay, conflicting payload rejection, revoked consent blocks new credit.");
 console.log("LIMITATION: sequential SQL invariants; no concurrent revocation/credit interleaving tested.");
}finally{
 try{query("DROP SCHEMA IF EXISTS liryboost_qa CASCADE;")}catch{console.error("Local QA cleanup failed; inspect disposable database.")}
}
