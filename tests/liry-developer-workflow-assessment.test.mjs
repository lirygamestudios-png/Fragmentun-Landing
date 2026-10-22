import test from "node:test";import assert from "node:assert/strict";
import {assessDeveloperWorkflow,LIRY_DEVELOPER_WORKFLOW_EXECUTION_ENABLED} from "../lib/games/liry-developer-workflow-assessment.ts";
const base={documentStatus:"correction_required",reminderStatus:"pending",expiresAt:"2026-11-01T00:00:00Z",now:"2026-10-25T00:00:00Z",warningDays:10,legalHold:false,lastReminderAt:null,reminderCount:0};
test("coordinator is read-only and cannot approve send or delete",()=>{
 const r=assessDeveloperWorkflow(base);assert.equal(LIRY_DEVELOPER_WORKFLOW_EXECUTION_ENABLED,false);assert.equal(r.maySend,false);assert.equal(r.mayApprove,false);assert.equal(r.mayDelete,false);
});
test("document correction is advisory and obeys reminder limits",()=>{
 assert.equal(assessDeveloperWorkflow(base).nextAction,"request_correction");
 assert.equal(assessDeveloperWorkflow({...base,reminderCount:3}).nextAction,"none");
});
test("legal hold or rejected files escalate to review",()=>{
 assert.equal(assessDeveloperWorkflow({...base,legalHold:true}).nextAction,"human_review");
 assert.equal(assessDeveloperWorkflow({...base,documentStatus:"rejected"}).nextAction,"human_review");
});
test("missing expiry policy is not silently treated as approved",()=>{
 assert.equal(assessDeveloperWorkflow({...base,warningDays:null}).nextAction,"policy_review");
});
