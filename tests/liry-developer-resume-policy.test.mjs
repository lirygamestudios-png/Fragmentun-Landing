import test from "node:test";
import assert from "node:assert/strict";
import {LIRY_DEVELOPER_RESUME_ENABLED,restoreDeveloperApplication,previewResumeHint} from "../lib/games/liry-developer-resume-policy.ts";
const snapshot={applicationId:"application_123",ownerUserId:"developer_123",revision:2,preparation:{commercialModel:"freemium",declarationsComplete:true},verified:{identity:true,rights:true,bank:true,admission:true}};
test("resumption remains disabled even with simulated verified user",()=>{
 assert.equal(LIRY_DEVELOPER_RESUME_ENABLED,false);
 assert.equal(restoreDeveloperApplication(snapshot,{authenticatedUserId:"developer_123",sessionVerified:true,serverOwnershipVerified:true}),null);
});
test("wrong owner and unverified sessions cannot restore a draft",()=>{
 assert.equal(restoreDeveloperApplication(snapshot,{authenticatedUserId:"other",sessionVerified:true,serverOwnershipVerified:true}),null);
 assert.equal(restoreDeveloperApplication(snapshot,{authenticatedUserId:"developer_123",sessionVerified:false,serverOwnershipVerified:true}),null);
});
test("resumption hints never claim a live persisted application",()=>{
 assert.match(previewResumeHint("es",true),/cuentas seguras/);
 assert.match(previewResumeHint("en",false),/No saved application/);
});
