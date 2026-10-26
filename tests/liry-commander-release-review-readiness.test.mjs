import test from "node:test";
import assert from "node:assert/strict";
import {assessReleaseReviewReadiness} from "../lib/games/game-release-review-readiness.ts";
const expected={gameId:"game-1",releaseId:"release-1"};
const evidence={...expected,deploymentId:"dpl_Valid123",commitSha:"a".repeat(40),validationRunId:"run-123",reviewerUserId:"reviewer-1",reviewedAt:"2026-10-20T12:00:00Z"};
const verified={authenticatedReviewerId:"reviewer-1",reviewerHasPublishingRole:true,reviewerMfaSatisfied:true,deploymentMatchesCommit:true,validationRunPassed:true,validationRunMatchesCommit:true,reviewerDecision:"approved",trustedDeploymentId:"dpl_Valid123",trustedCommitSha:"a".repeat(40),trustedValidationRunId:"run-123"};
test("absent trusted context fails closed",()=>{
 const result=assessReleaseReviewReadiness(expected,evidence,null);
 assert.equal(result.reviewReady,false);
 assert.equal(result.publishAuthorized,false);
 assert.ok(result.reasons.includes("trusted_review_context_missing"));
});
test("identity, MFA and deployment checks are independently mandatory",()=>{
 const result=assessReleaseReviewReadiness(expected,evidence,{...verified,authenticatedReviewerId:"other",reviewerMfaSatisfied:false,deploymentMatchesCommit:false});
 assert.equal(result.reviewReady,false);
 for(const reason of ["reviewer_identity_mismatch","reviewer_mfa_required","deployment_commit_not_verified"])assert.ok(result.reasons.includes(reason));
});
test("verified review readiness never grants publication",()=>{
 const result=assessReleaseReviewReadiness(expected,evidence,verified);
 assert.equal(result.reviewReady,true);
 assert.equal(result.publishAuthorized,false);
});
test("foreign game and nonpassing validation cannot become review ready",()=>{
 const result=assessReleaseReviewReadiness({...expected,gameId:"foreign"},evidence,{...verified,validationRunPassed:false});
 assert.equal(result.reviewReady,false);
 assert.ok(result.reasons.includes("incomplete_release_evidence"));
 assert.ok(result.reasons.includes("validation_run_not_verified"));
});

test("client-supplied identifiers cannot replace trusted server records",()=>{
 const result=assessReleaseReviewReadiness(expected,evidence,{...verified,trustedDeploymentId:"dpl_Other123",trustedCommitSha:"b".repeat(40),trustedValidationRunId:"other-run"});
 assert.equal(result.reviewReady,false);
 assert.equal(result.publishAuthorized,false);
 assert.ok(result.reasons.includes("deployment_commit_not_verified"));
 assert.ok(result.reasons.includes("validation_run_not_verified"));
});
