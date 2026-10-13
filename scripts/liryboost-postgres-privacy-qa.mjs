#!/usr/bin/env node
/** LiryBoost C07/C08: isolated PostgreSQL privacy smoke test.
 * Synthetic users, local disposable DB only. NOT the production RLS policy.
 */
import {spawnSync} from "node:child_process";
import {reviewIsolatedPostgresTarget} from "../lib/liryboost/isolated-postgres-guard.ts";
const url=process.env.LIRYBOOST_QA_DATABASE_URL;
if(!reviewIsolatedPostgresTarget({environment:process.env.LIRYBOOST_QA_ENVIRONMENT,
 explicitQaApproval:process.env.LIRYBOOST_QA_APPROVAL,databaseUrl:url}).allowed){
 console.error("REFUSED: disposable local PostgreSQL required.");process.exit(2);
}
const run=(sql)=>{
 const r=spawnSync("psql",["-X","-qAt","-v","ON_ERROR_STOP=1","-d",url],{
 input:sql,encoding:"utf8",timeout:15000,env:{...process.env,PGCONNECT_TIMEOUT:"3"}});
 if(r.error||r.status!==0)throw Error("Local SQL privacy QA failed");
 return r.stdout.trim();
};
const id="123e4567-e89b-42d3-a456-426614174000";
// Direct invocation must not delete an existing synthetic QA schema.
const preexisting=run("SELECT count(*) FROM pg_namespace WHERE nspname='liryboost_qa';");
if(preexisting!=="0"){console.error("REFUSED: QA schema already exists.");process.exit(2)}
let created=false;
try{
 run(`CREATE SCHEMA liryboost_qa;`);
 created=true;
 run(`CREATE TABLE liryboost_qa.private_members(user_id uuid PRIMARY KEY,contact_email text NOT NULL,alias text NOT NULL,visible boolean NOT NULL);
 CREATE TABLE liryboost_qa.scores(user_id uuid PRIMARY KEY REFERENCES liryboost_qa.private_members(user_id),points int NOT NULL CHECK(points>=0));
 INSERT INTO liryboost_qa.private_members VALUES ('${id}','synthetic@example.test','Gamer QA',true);
 INSERT INTO liryboost_qa.scores VALUES ('${id}',3);
 CREATE VIEW liryboost_qa.public_top10 AS
 SELECT m.alias,s.points FROM liryboost_qa.private_members m JOIN liryboost_qa.scores s USING(user_id)
 WHERE m.visible=true ORDER BY s.points DESC LIMIT 10;`);
 const before=run("SELECT alias||'|'||points FROM liryboost_qa.public_top10;");
 if(before!=="Gamer QA|3")throw Error("Expected synthetic visible ranking");
 const columns=run("SELECT string_agg(column_name,',' ORDER BY ordinal_position) FROM information_schema.columns WHERE table_schema='liryboost_qa' AND table_name='public_top10';");
 if(columns!=="alias,points")throw Error("Private data exposed in view");
 run(`UPDATE liryboost_qa.private_members SET visible=false WHERE user_id='${id}';`);
 if(run("SELECT count(*) FROM liryboost_qa.public_top10;")!=="0")throw Error("Revoked alias remains public");
 console.log("PASS: public view contains only alias/points and removes revoked member.");
 console.log("LIMITATION: role grants, RLS, cached responses and actual API not tested.");
}finally{
 if(created){try{run("DROP SCHEMA IF EXISTS liryboost_qa CASCADE;")}catch{console.error("QA cleanup failed")}}
}
