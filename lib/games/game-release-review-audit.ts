import {assessReleaseReviewReadiness,type TrustedReleaseReviewContext} from "./game-release-review-readiness";
import type {GameReleaseApprovalEvidence} from "./game-release-approval-evidence";

/** Draft for a server-owned, append-only audit sink. No database writes or publication grants. */
export type ReleaseReviewAuditDraft={
 gameId:string;releaseId:string;deploymentId:string;commitSha:string;validationRunId:string;
 actorUserId:string;decision:"approved"|"rejected"|"pending";recordedAt:string;
 readiness:"ready"|"blocked";reasons:readonly string[];publishAuthorized:false;
};
export function prepareReleaseReviewAuditDraft(
 expected:{gameId:string;releaseId:string},
 evidence:GameReleaseApprovalEvidence|null,
 trusted:TrustedReleaseReviewContext|null,
 serverRecordedAt:string
):ReleaseReviewAuditDraft{
 if(!trusted?.authenticatedReviewerId||!trusted.reviewerHasPublishingRole||!trusted.reviewerMfaSatisfied)
   throw new Error("authenticated_review_authority_required");
 const timestamp=Date.parse(serverRecordedAt);
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(serverRecordedAt)||
   !Number.isFinite(timestamp)||new Date(timestamp).toISOString()!==serverRecordedAt)
   throw new Error("invalid_server_audit_timestamp");
 if(!expected.gameId||!expected.releaseId)throw new Error("release_identity_required");
 const review=assessReleaseReviewReadiness(expected,evidence,trusted);
 return {
   gameId:expected.gameId,releaseId:expected.releaseId,
   deploymentId:trusted.trustedDeploymentId,commitSha:trusted.trustedCommitSha,
   validationRunId:trusted.trustedValidationRunId,
   actorUserId:trusted.authenticatedReviewerId,decision:trusted.reviewerDecision,
   recordedAt:serverRecordedAt,readiness:review.reviewReady?"ready":"blocked",
   reasons:[...review.reasons],publishAuthorized:false
 };
}
