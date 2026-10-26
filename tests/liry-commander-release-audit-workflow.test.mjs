import test from "node:test";
import assert from "node:assert/strict";
import {evaluateReleaseReviewAudit} from "../lib/games/game-release-audit-workflow.ts";
const ids={gameId:"game-1",releaseId:"release-1"};
const evidence={...ids,deploymentId:"dpl_Valid123",commitSha:"a".repeat(40),validationRunId:"run-123",reviewerUserId:"admin-1",reviewedAt:"2026-10-20T12:00:00Z"};
const trusted={authenticatedReviewerId:"admin-1",reviewerHasPublishingRole:true,reviewerMfaSatisfied:true,deploymentMatchesCommit:true,validationRunPassed:true,validationRunMatchesCommit:true,trustedDeploymentId:"dpl_Valid123",trustedCommitSha:"a".repeat(40),trustedValidationRunId:"run-123",reviewerDecision:"approved"};
const server={recordedAt:"2026-10-26T17:00:00.000Z",idempotencyKey:"audit_unique_12345",alreadyExists:false};
test("verified review can prepare audit but never publish",()=>{
 const r=evaluateReleaseReviewAudit(ids,evidence,trusted,server);
 assert.equal(r.appendPrepared,true);assert.equal(r.publishAuthorized,false);assert.equal(r.draft?.publishAuthorized,false);
});
test("untrusted and duplicate requests cannot prepare audit",()=>{
 const missing=evaluateReleaseReviewAudit(ids,evidence,null,server);
 const duplicated=evaluateReleaseReviewAudit(ids,evidence,trusted,{...server,alreadyExists:true});
 assert.equal(missing.appendPrepared,false);assert.equal(duplicated.appendPrepared,false);
 assert.equal(duplicated.draft,null);
});
test("invalid reviewer MFA or foreign version fails closed",()=>{
 const denied=evaluateReleaseReviewAudit(ids,evidence,{...trusted,reviewerMfaSatisfied:false},server);
 const foreign=evaluateReleaseReviewAudit(ids,{...evidence,commitSha:"b".repeat(40)},trusted,server);
 assert.equal(denied.appendPrepared,false);
 assert.equal(foreign.draft?.readiness,"blocked");
 assert.equal(foreign.publishAuthorized,false);
});
