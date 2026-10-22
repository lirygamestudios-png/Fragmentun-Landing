import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Offline repeated-access risk model; does not collect IP addresses, send notifications or block users. */
export type AccessDenialCode="revoked"|"expired"|"unknown_recipient"|"access_limit"|"legal_hold";
export type AccessAttemptSummary=Readonly<{grantRef:string;actorPseudonym:string;occurredAt:string;denial:AccessDenialCode}>;
export type AccessPatternLevel="normal"|"review"|"urgent";
export type AccessPatternAssessment=Readonly<{enabled:false;level:AccessPatternLevel;deniedCount:number;requiresHumanReview:boolean;alertSent:false;blocked:false}>;
export type AccessPatternPolicy=Readonly<{windowMinutes:number;reviewThreshold:number;urgentThreshold:number;approved:boolean}>;
export function previewAccessPattern(attempts:readonly AccessAttemptSummary[],nowMs:number,policy:AccessPatternPolicy):AccessPatternAssessment{
 const fallback:AccessPatternAssessment={enabled:false,level:"normal",deniedCount:0,requiresHumanReview:false,alertSent:false,blocked:false};
 if(biometricProviderStatus!=="disabled"||!policy.approved||!Number.isFinite(nowMs)||!Number.isSafeInteger(policy.windowMinutes)||policy.windowMinutes<1||!Number.isSafeInteger(policy.reviewThreshold)||policy.reviewThreshold<2||!Number.isSafeInteger(policy.urgentThreshold)||policy.urgentThreshold<=policy.reviewThreshold)return fallback;
 const recent=attempts.filter(a=>{const t=Date.parse(a.occurredAt);return Boolean(a.grantRef&&a.actorPseudonym)&&Number.isFinite(t)&&t<=nowMs&&nowMs-t<=policy.windowMinutes*60_000;});
 const count=recent.length;
 const level:AccessPatternLevel=count>=policy.urgentThreshold?"urgent":count>=policy.reviewThreshold?"review":"normal";
 return {enabled:false,level,deniedCount:count,requiresHumanReview:level!=="normal",alertSent:false,blocked:false};
}
/** Thresholds must be approved after threat and fairness review; in production count per actor/grant, not across unrelated users. */
