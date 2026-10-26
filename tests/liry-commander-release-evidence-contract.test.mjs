import test from "node:test";
import assert from "node:assert/strict";
import {reviewGameReleaseApprovalEvidence,GAME_RELEASE_APPROVAL_REQUIREMENTS} from "../lib/games/game-release-approval-evidence.ts";
const id={gameId:"game-1",releaseId:"release-1"};
test("release evidence fails closed when absent",()=>{
 const result=reviewGameReleaseApprovalEvidence(id,null);
 assert.equal(result.complete,false);
 assert.equal(result.missing.length,GAME_RELEASE_APPROVAL_REQUIREMENTS.length);
});
test("release evidence rejects mismatched game and missing human approval",()=>{
 const result=reviewGameReleaseApprovalEvidence(id,{gameId:"other",releaseId:"release-1",deploymentId:"dpl_Valid123",commitSha:"a".repeat(40),validationRunId:"run-1",reviewerUserId:"",reviewedAt:""});
 assert.equal(result.complete,false);
 assert.ok(result.missing.includes(GAME_RELEASE_APPROVAL_REQUIREMENTS[0]));
 assert.ok(result.missing.includes(GAME_RELEASE_APPROVAL_REQUIREMENTS[3]));
});
