import {prepareReleaseReviewAuditDraft,type ReleaseReviewAuditDraft} from "./game-release-review-audit";
import {preflightReleaseReviewAuditAppend} from "./game-release-audit-preflight";
import type {GameReleaseApprovalEvidence} from "./game-release-approval-evidence";
import type {TrustedReleaseReviewContext} from "./game-release-review-readiness";

/** Server-only orchestration model: no I/O, writes, state transitions or publication grants. */
export function evaluateReleaseReviewAudit(
 expected:{gameId:string;releaseId:string},
 evidence:GameReleaseApprovalEvidence|null,
 trusted:TrustedReleaseReviewContext|null,
 server:{recordedAt:string;idempotencyKey:string;alreadyExists:boolean}
):{appendPrepared:boolean;publishAuthorized:false;draft:ReleaseReviewAuditDraft|null;reasons:readonly string[]}{
 if(!trusted)return {appendPrepared:false,publishAuthorized:false,draft:null,reasons:["trusted_review_context_missing"]};
 try{
  const draft=prepareReleaseReviewAuditDraft(expected,evidence,trusted,server.recordedAt);
  const check=preflightReleaseReviewAuditAppend(draft,{
   actorUserId:trusted.authenticatedReviewerId,gameId:expected.gameId,releaseId:expected.releaseId,
   commitSha:trusted.trustedCommitSha,deploymentId:trusted.trustedDeploymentId,
   validationRunId:trusted.trustedValidationRunId,
   idempotencyKey:server.idempotencyKey,alreadyExists:server.alreadyExists
  });
  return {appendPrepared:check.accepted,publishAuthorized:false,draft:check.accepted?draft:null,reasons:check.reasons};
 }catch(error){
  const code=error instanceof Error?error.message:"audit_preparation_failed";
  const allowed=new Set(["authenticated_review_authority_required","invalid_server_audit_timestamp","release_identity_required"]);
  return {appendPrepared:false,publishAuthorized:false,draft:null,reasons:[allowed.has(code)?code:"audit_preparation_failed"]};
 }
}
