#!/usr/bin/env node
/** Two independent psql sessions race to claim the same synthetic invitee.
 * Local disposable PostgreSQL only. No Supabase or production database access.
 */
import {spawn,spawnSync} from "node:child_process";
import {reviewIsolatedPostgresTarget} from "../lib/liryboost/isolated-postgres-guard.ts";
const url=process.env.LIRYBOOST_QA_DATABASE_URL;
const guard=reviewIsolatedPostgresTarget({
 environment:process.env.LIRYBOOST_QA_ENVIRONMENT,
 explicitQaApproval:process.env.LIRYBOOST_QA_APPROVAL,
 databaseUrl:url
});
if(!guard.allowed){console.error("REFUSED: requires explicitly approved disposable local PostgreSQL.");process.exit(2)}
const env={...process.env,PGCONNECT_TIMEOUT:"3"};
function sql(query){
 const r=spawnSync("psql",["-X","-qAt","-v","ON_ERROR_STOP=1","-d",url],{encoding:"utf8",input:query,env,timeout:15000});
 if(r.status!==0||r.error)throw Error("Local PostgreSQL QA command failed");
 return r.stdout.trim();
}
function session(query){
 return new Promise((resolve,reject)=>{
  const p=spawn("psql",["-X","-qAt","-v","ON_ERROR_STOP=1","-d",url],{env,stdio:["pipe","pipe","pipe"]});
  let out="",error="";
  p.stdout.setEncoding("utf8");p.stderr.setEncoding("utf8");
  p.stdout.on("data",x=>out+=x);p.stderr.on("data",x=>error+=x);
  const timeout=setTimeout(()=>p.kill(),10000);
  p.on("error",reject);
  p.on("close",code=>{clearTimeout(timeout);code===0?resolve(out.trim()):reject(Error("Concurrent PostgreSQL session failed"))});
  p.stdin.end(query);
 });
}
// Direct execution safety: never reuse or delete a pre-existing QA schema.
const existingQaSchema=sql("SELECT count(*) FROM pg_namespace WHERE nspname='liryboost_qa';");
if(existingQaSchema!=="0"){console.error("REFUSED: pre-existing QA schema.");process.exit(2)}
let qaSchemaCreated=false;
try{
 sql("CREATE SCHEMA liryboost_qa;");
 qaSchemaCreated=true;
 sql("CREATE TABLE liryboost_qa.concurrent_claims(invitee uuid PRIMARY KEY,referrer uuid NOT NULL);");
 const runs=Number(process.env.LIRYBOOST_QA_RUNS||"100");
 if(!Number.isSafeInteger(runs)||runs<1||runs>1000)throw Error("Invalid QA_RUNS");
 for(let i=0;i<runs;i++){
  sql("TRUNCATE liryboost_qa.concurrent_claims;");
  const invitee="123e4567-e89b-42d3-a456-426614174001";
  const statement=(referrer)=>`BEGIN; INSERT INTO liryboost_qa.concurrent_claims VALUES ('${invitee}', '${referrer}') ON CONFLICT(invitee) DO NOTHING RETURNING referrer; COMMIT;`;
  const outcomes=await Promise.all([
   session(statement("123e4567-e89b-42d3-a456-426614174000")),
   session(statement("123e4567-e89b-42d3-a456-426614174002"))
  ]);
  const count=sql("SELECT count(*) FROM liryboost_qa.concurrent_claims;");
  const credited=outcomes.filter(x=>/123e4567-e89b-42d3-a456-42661417400[02]/.test(x)).length;
  if(count!=="1"||credited!==1)throw Error(`Uniqueness failed on iteration ${i+1}`);
 }
 console.log(`PASS: ${runs} two-session claim races; exactly one winner per invitee.`);
 console.log("LIMITATION: isolated schema exercise only; does not test production consent workflows.");
}finally{
 if(qaSchemaCreated){try{sql("DROP SCHEMA IF EXISTS liryboost_qa CASCADE;")}catch{console.error("QA cleanup failed: inspect disposable database")}
}
}
