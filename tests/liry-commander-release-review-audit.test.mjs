import test from "node:test";
import assert from "node:assert/strict";
import {prepareReleaseReviewAuditDraft} from "../lib/games/game-release-review-audit.ts";
const ids={gameId:"game-1",releaseId:"release-1"};
const evidence={...ids,deploymentId:"dpl_Valid123",commitSha:"a".repeat(40),validationRunId:"run-123",reviewerUserId:"reviewer-1",reviewedAt:"2026-10-20T12:00:00Z"};
const trusted={authenticatedReviewerId:"reviewer-1",reviewerHasPublishingRole:true,reviewerMfaSatisfied:true,deploymentMatchesCommit:true,validationRunPassed:true,validationRunMatchesCommit:true,trustedDeploymentId:"dpl_Valid123",trustedCommitSha:"a".repeat(40),trustedValidationRunId:"run-123",reviewerDecision:"approved"};
test("audit draft uses server-owned IDs and cannot authorize publishing",()=>{
 const draft=prepareReleaseReviewAuditDraft(ids,evidence,trusted,"2026-10-26T17:00:00.000Z");
 assert.equal(draft.actorUserId,"reviewer-1");
 assert.equal(draft.readiness,"ready");
 assert.equal(draft.publishAuthorized,false);
});
test("audit draft rejects untrusted reviewer identity and MFA",()=>{
 assert.throws(()=>prepareReleaseReviewAuditDraft(ids,evidence,{...trusted,reviewerMfaSatisfied:false},"2026-10-26T17:00:00.000Z"),/authenticated_review_authority_required/);
});
test("audit draft rejects malformed server timestamp",()=>{
 assert.throws(()=>prepareReleaseReviewAuditDraft(ids,evidence,trusted,"2026-02-30T17:00:00.000Z"),/invalid_server_audit_timestamp/);
});
test("audit draft cannot silently approve forged version evidence",()=>{
 const draft=prepareReleaseReviewAuditDraft(ids,{...evidence,commitSha:"b".repeat(40)},trusted,"2026-10-26T17:00:00.000Z");
 assert.equal(draft.readiness,"blocked");
 assert.equal(draft.publishAuthorized,false);
 assert.ok(draft.reasons.includes("deployment_commit_not_verified"));
});
