#!/usr/bin/env node
/** LiryBoost C07: local-only synthetic RLS access check. Not production policy. */
import {spawnSync} from "node:child_process";
import {reviewIsolatedPostgresTarget} from "../lib/liryboost/isolated-postgres-guard.ts";
const url=process.env.LIRYBOOST_QA_DATABASE_URL;
if(!reviewIsolatedPostgresTarget({environment:process.env.LIRYBOOST_QA_ENVIRONMENT,explicitQaApproval:process.env.LIRYBOOST_QA_APPROVAL,databaseUrl:url}).allowed){console.error("REFUSED: disposable localhost PostgreSQL required");process.exit(2)}
const run=(sql,shouldFail=false)=>{
 const p=spawnSync("psql",["-X","-qAt","-v","ON_ERROR_STOP=1","-d",url],{input:sql,encoding:"utf8",timeout:15000,env:{...process.env,PGCONNECT_TIMEOUT:"3"}});
 if(p.error||((p.status!==0)!==shouldFail))throw Error("Unexpected synthetic RLS result");
 return p.stdout.trim();
};
const existingQaSchema=run("SELECT count(*) FROM pg_namespace WHERE nspname='liryboost_qa';");
if(existingQaSchema!=="0"){console.error("REFUSED: existing QA schema.");process.exit(2)}
let qaSchemaCreated=false;
try{
 run("CREATE SCHEMA liryboost_qa;");
 qaSchemaCreated=true;
 run(` CREATE ROLE liryboost_qa_anon NOLOGIN;
 CREATE ROLE liryboost_qa_member NOLOGIN;
 CREATE TABLE liryboost_qa.members(id uuid PRIMARY KEY, alias text NOT NULL,email text NOT NULL);
 INSERT INTO liryboost_qa.members VALUES ('123e4567-e89b-42d3-a456-426614174001','QA alias','private@example.test');
 ALTER TABLE liryboost_qa.members ENABLE ROW LEVEL SECURITY;
 ALTER TABLE liryboost_qa.members FORCE ROW LEVEL SECURITY;
 GRANT USAGE ON SCHEMA liryboost_qa TO liryboost_qa_anon,liryboost_qa_member;
 GRANT SELECT ON liryboost_qa.members TO liryboost_qa_member;
 CREATE POLICY only_self ON liryboost_qa.members FOR SELECT TO liryboost_qa_member USING(id::text=current_setting('liryboost_qa.user_id',true));`);
 run("SET ROLE liryboost_qa_anon; SELECT count(*) FROM liryboost_qa.members;",true);
 const stranger=run("SET ROLE liryboost_qa_member; SET liryboost_qa.user_id='123e4567-e89b-42d3-a456-426614174002'; SELECT count(*) FROM liryboost_qa.members;");
 const owner=run("SET ROLE liryboost_qa_member; SET liryboost_qa.user_id='123e4567-e89b-42d3-a456-426614174001'; SELECT count(*) FROM liryboost_qa.members;");
 if(stranger!=="0"||owner!=="1")throw Error("Synthetic RLS isolation failed");
 console.log("PASS: anonymous access denied, unrelated member hidden, owner permitted");
 console.log("LIMIT: synthetic RLS policy, not real Supabase authorization");
}finally{
 if(qaSchemaCreated){try{run("DROP SCHEMA IF EXISTS liryboost_qa CASCADE; DROP ROLE IF EXISTS liryboost_qa_member; DROP ROLE IF EXISTS liryboost_qa_anon;")}catch{console.error("Disposable QA cleanup failed")}}
}
