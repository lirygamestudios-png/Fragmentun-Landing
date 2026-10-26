import {reviewGameReleaseApprovalEvidence,type GameReleaseApprovalEvidence} from "./game-release-approval-evidence";

/** Read-only assessment. A caller must obtain context from trusted server-side sources. */
export type TrustedReleaseReviewContext={
 authenticatedReviewerId:string;
 reviewerHasPublishingRole:boolean;
 reviewerMfaSatisfied:boolean;
 deploymentMatchesCommit:boolean;
 validationRunPassed:boolean;
 validationRunMatchesCommit:boolean;
 trustedDeploymentId:string;
 trustedCommitSha:string;
 trustedValidationRunId:string;
 reviewerDecision:"approved"|"rejected"|"pending";
};
export function assessReleaseReviewReadiness(
 expected:{gameId:string;releaseId:string},
 evidence:GameReleaseApprovalEvidence|null,
 context:TrustedReleaseReviewContext|null
):{reviewReady:boolean;publishAuthorized:false;reasons:string[]}{
 const checklist=reviewGameReleaseApprovalEvidence(expected,evidence);
 const reasons:string[]=[];
 if(!checklist.complete)reasons.push("incomplete_release_evidence");
 if(!context){reasons.push("trusted_review_context_missing");return {reviewReady:false,publishAuthorized:false,reasons};}
 if(!context.authenticatedReviewerId||!evidence||context.authenticatedReviewerId!==evidence.reviewerUserId)
   reasons.push("reviewer_identity_mismatch");
 if(!context.reviewerHasPublishingRole)reasons.push("publishing_role_required");
 if(!context.reviewerMfaSatisfied)reasons.push("reviewer_mfa_required");
 if(!context.deploymentMatchesCommit||!evidence||!context.trustedDeploymentId||!context.trustedCommitSha||context.trustedDeploymentId!==evidence.deploymentId||context.trustedCommitSha!==evidence.commitSha)
   reasons.push("deployment_commit_not_verified");
 if(!context.validationRunPassed||!context.validationRunMatchesCommit||!evidence||!context.trustedValidationRunId||context.trustedValidationRunId!==evidence.validationRunId)
   reasons.push("validation_run_not_verified");
 if(context.reviewerDecision!=="approved")reasons.push("human_approval_not_confirmed");
 // This result is for administrative review only; it is never a publication grant.
 return {reviewReady:reasons.length===0,publishAuthorized:false,reasons};
}
