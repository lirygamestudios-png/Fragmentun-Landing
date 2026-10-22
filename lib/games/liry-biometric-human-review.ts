import {biometricProviderStatus,type IdentityDecision} from "./liry-biometric-readiness";
/** Offline procedural blueprint only. No ID scans, selfies, network calls or persistence. */
export type HumanReviewReason="liveness_inconclusive"|"document_unreadable"|"identity_mismatch"|"accessibility_alternative"|"expired_verification"|"applicant_appeal";
export type HumanReviewStage="awaiting_assignment"|"awaiting_additional_information"|"awaiting_review"|"resolved_verified"|"resolved_rejected"|"closed";
export type HumanReviewAction="assign"|"request_information"|"information_received"|"confirm_verified"|"confirm_rejected"|"close";
export type HumanReviewActor="authorized_reviewer"|"applicant"|"system";
export type HumanReviewRequest=Readonly<{applicationId:string;verificationDecision:IdentityDecision;reason:HumanReviewReason;stage:HumanReviewStage}>;
export type ReviewResolution=Readonly<{allowed:false;reason:"biometrics_disabled"|"unauthorized_actor"|"invalid_transition"|"requires_separate_identity_and_admission_review"}>;
const reviewerActions=new Set<HumanReviewAction>(["assign","request_information","confirm_verified","confirm_rejected","close"]);
const next:Readonly<Record<HumanReviewStage,Partial<Record<HumanReviewAction,HumanReviewStage>>>>={
 awaiting_assignment:{assign:"awaiting_review"},
 awaiting_additional_information:{information_received:"awaiting_review"},
 awaiting_review:{request_information:"awaiting_additional_information",confirm_verified:"resolved_verified",confirm_rejected:"resolved_rejected"},
 resolved_verified:{close:"closed"},resolved_rejected:{close:"closed"},closed:{}
};
export function assessHumanReviewAction(review:HumanReviewRequest,action:HumanReviewAction,actor:HumanReviewActor):ReviewResolution{
 if(biometricProviderStatus==="disabled")return {allowed:false,reason:"biometrics_disabled"};
 if(reviewerActions.has(action)&&actor!=="authorized_reviewer")return {allowed:false,reason:"unauthorized_actor"};
 if(action==="information_received"&&actor!=="applicant")return {allowed:false,reason:"unauthorized_actor"};
 if(!next[review.stage][action])return {allowed:false,reason:"invalid_transition"};
 return {allowed:false,reason:"requires_separate_identity_and_admission_review"};
}
/** Never treat a human-review result as automatic developer onboarding approval. */
