#!/usr/bin/env node
/** LiryBoost C04: two PostgreSQL clients contend to revoke consent and credit.
 * Disposable localhost database ONLY. Assumes no production data or credentials.
 * Race ordering is serialized by locking the invitee consent row FOR UPDATE.
 */
import {spawn,spawnSync} from "node:child_process";
import {reviewIsolatedPostgresTarget} from "../lib/liryboost/isolated-postgres-guard.ts";
const databaseUrl=process.env.LIRYBOOST_QA_DATABASE_URL;
if(!reviewIsolatedPostgresTarget({environment:process.env.LIRYBOOST_QA_ENVIRONMENT,
 explicitQaApproval:process.env.LIRYBOOST_QA_APPROVAL,databaseUrl}).allowed){
 console.error("REFUSED: disposable localhost PostgreSQL required.");process.exit(2)
}
const env={...process.env,PGCONNECT_TIMEOUT:"3"};
function sql(query){
 const p=spawnSync("psql",["-X","-qAt","-v","ON_ERROR_STOP=1","-d",databaseUrl],{input:query,encoding:"utf8",timeout:15000,env});
 if(p.error||p.status!==0)throw Error("QA SQL failed");return p.stdout.trim();
}
function session(query){
 return new Promise((resolve,reject)=>{
  const p=spawn("psql",["-X","-qAt","-v","ON_ERROR_STOP=1","-d",databaseUrl],{env,stdio:["pipe","pipe","pipe"]});
  let output="";p.stdout.setEncoding("utf8");p.stdout.on("data",chunk=>output+=chunk);
  const timer=setTimeout(()=>p.kill(),12000);
  p.once("error",err=>{clearTimeout(timer);reject(err)});
  p.once("close",code=>{clearTimeout(timer);code===0?resolve(output.trim()):reject(Error("Concurrent QA session failed"))});
  p.stdin.end(query);
 });
}
const invitee="123e4567-e89b-42d3-a456-426614174001",referrer="123e4567-e89b-42d3-a456-426614174000";
const runs=Number(process.env.LIRYBOOST_QA_RUNS||100);
if(!Number.isSafeInteger(runs)||runs<1||runs>1000)throw Error("Invalid QA runs");
const existingQaSchema=sql("SELECT count(*) FROM pg_namespace WHERE nspname='liryboost_qa';");
if(existingQaSchema!=="0"){console.error("REFUSED: existing QA schema.");process.exit(2)}
let qaSchemaCreated=false;
try{
 sql("CREATE SCHEMA liryboost_qa;");
 qaSchemaCreated=true;
 sql(` CREATE TABLE liryboost_qa.consent_current(user_id uuid PRIMARY KEY, active boolean NOT NULL);
 CREATE TABLE liryboost_qa.credits(invitee uuid PRIMARY KEY, referrer uuid NOT NULL);`);
 for(let i=0;i<runs;i++){
  sql(`TRUNCATE liryboost_qa.credits,liryboost_qa.consent_current;
    INSERT INTO liryboost_qa.consent_current VALUES ('${invitee}',true);`);
  // Both operations lock the same row before acting. A committed revocation
  // before the credit's lock acquisition must prevent any new credit.
  const revoke=`BEGIN; SELECT active FROM liryboost_qa.consent_current WHERE user_id='${invitee}' FOR UPDATE;
   UPDATE liryboost_qa.consent_current SET active=false WHERE user_id='${invitee}';
   COMMIT; SELECT 'revoked';`;
  const credit=`BEGIN; SELECT active FROM liryboost_qa.consent_current WHERE user_id='${invitee}' FOR UPDATE;
   INSERT INTO liryboost_qa.credits(invitee,referrer)
    SELECT '${invitee}', '${referrer}' FROM liryboost_qa.consent_current
    WHERE user_id='${invitee}' AND active=true ON CONFLICT DO NOTHING;
   COMMIT; SELECT 'credited';`;
  await Promise.all([session(revoke),session(credit)]);
  const result=sql(`SELECT (SELECT active FROM liryboost_qa.consent_current WHERE user_id='${invitee}')::text,
     (SELECT count(*) FROM liryboost_qa.credits)::text;`);
  // Credit preceding the committed revocation is legitimate in this contract,
  // but any credit after a fully committed revocation is not.
  if(!["f|0","f|1"].includes(result))throw Error(`Unexpected state in iteration ${i+1}: ${result}`);
  // Verify that an additional attempt after revocation never credits a new invitee.
  const post=sql(`INSERT INTO liryboost_qa.credits(invitee,referrer)
    SELECT '${invitee}', '${referrer}' FROM liryboost_qa.consent_current
    WHERE user_id='${invitee}' AND active=true
    ON CONFLICT DO NOTHING RETURNING invitee;`);
  if(post!=="")throw Error("Post-revocation credit was admitted");
 }
 console.log(`PASS: ${runs} overlapping revoke/credit operations; post-revocation credits blocked.`);
 console.log("LIMITATION: previous valid credits are not retroactively removed; full revocation business rules require separate design.");
}finally{
 if(qaSchemaCreated){try{sql("DROP SCHEMA IF EXISTS liryboost_qa CASCADE;")}catch{console.error("Local QA cleanup failed")}}
}
