/** LiryBoost QA C01: ejecutar únicamente en PostgreSQL LOCAL DESCARTABLE.
 * Uso: LIRYBOOST_QA_DATABASE_URL=postgresql://tester:pass@127.0.0.1:5432/liryboost_qa_disposable
 *      LIRYBOOST_QA_APPROVAL=LIRYBOOST_LOCAL_QA_ONLY npm run qa:liryboost:c01
 * Requiere psql en PATH. No importa variables de producción.
 */
import {spawnSync,spawn} from "node:child_process";
import {randomUUID} from "node:crypto";
import {reviewIsolatedPostgresTarget} from "../lib/liryboost/isolated-postgres-guard.ts";
const databaseUrl=process.env.LIRYBOOST_QA_DATABASE_URL;
const guard=reviewIsolatedPostgresTarget({
 environment:"isolated_test",
 databaseUrl,
 explicitQaApproval:process.env.LIRYBOOST_QA_APPROVAL
});
if(!guard.allowed){console.error("ABORTADO: destino PostgreSQL no autorizado para QA local.");process.exit(2);}
const env={PATH:process.env.PATH||"",PGCONNECT_TIMEOUT:"5"};
function run(sql){
 const result=spawnSync("psql",["-X","-A","-t","-v","ON_ERROR_STOP=1","-d",databaseUrl,"-c",sql],{env,encoding:"utf8",timeout:10000});
 if(result.error||result.status!==0)throw Error("psql local falló: "+String(result.stderr||result.error?.message||"error"));
 return result.stdout.trim();
}
function runConcurrent(sql){
 return new Promise((resolve,reject)=>{
  const child=spawn("psql",["-X","-A","-t","-v","ON_ERROR_STOP=1","-d",databaseUrl,"-c",sql],{env,stdio:["ignore","pipe","pipe"]});
  let out="",err="";
  child.stdout.on("data",c=>out+=c);child.stderr.on("data",c=>err+=c);
  child.on("error",reject);child.on("close",code=>code===0?resolve(out.trim()):reject(Error("Fallo en psql local: "+err)));
 });
}
try{
 // Tabla única dentro de la base descartable, nunca en Supabase.
 run("CREATE SCHEMA IF NOT EXISTS liryboost_qa; CREATE TABLE IF NOT EXISTS liryboost_qa.concurrent_invitee_claims (invitee_id uuid PRIMARY KEY, referrer_id uuid NOT NULL, test_run uuid NOT NULL)");
 const runId=randomUUID(),invitee=randomUUID(),refA=randomUUID(),refB=randomUUID();
 const sql=ref=>`INSERT INTO liryboost_qa.concurrent_invitee_claims(invitee_id,referrer_id,test_run) VALUES ('${invitee}','${ref}','${runId}') ON CONFLICT(invitee_id) DO NOTHING RETURNING referrer_id`;
 const [a,b]=await Promise.all([runConcurrent(sql(refA)),runConcurrent(sql(refB))]);
 const winner=run(`SELECT referrer_id::text FROM liryboost_qa.concurrent_invitee_claims WHERE invitee_id='${invitee}' AND test_run='${runId}'`);
 const count=run(`SELECT count(*) FROM liryboost_qa.concurrent_invitee_claims WHERE invitee_id='${invitee}' AND test_run='${runId}'`);
 if(count!=="1"||Number(Boolean(a))+Number(Boolean(b))!==1||![refA,refB].includes(winner))
  throw Error("C01 falló: se esperaba exactamente un ganador.");
 console.log("C01 APROBADO: un ganador para dos solicitudes simultáneas. Sin escrituras a producción.");
}catch(e){console.error(String(e));process.exitCode=1;}
