import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Offline compliance dashboard model; no live case data or notifications. */
export type PrivacyComplianceItem=Readonly<{requestRef:string;applicationRef:string;stage:"requested"|"under_review"|"awaiting_processor"|"legal_hold"|"confirmed"|"closed";receivedAt:string;lastReviewedAt:string|null;processorConfirmed:boolean;legalHold:boolean}>;
export type PrivacyComplianceFlag="pending_review"|"incomplete_confirmation"|"legal_hold_review"|"invalid_record";
export type PrivacyComplianceSnapshot=Readonly<{enabled:false;pendingReview:number;incompleteConfirmations:number;legalHoldReviews:number;flags:readonly PrivacyComplianceFlag[]}>;
/** Counts are schematic and not live operational metrics. */
export function assessPrivacyCompliance(records:readonly PrivacyComplianceItem[],nowMs:number):PrivacyComplianceSnapshot{
 const flags:PrivacyComplianceFlag[]=[];
 if(!Number.isFinite(nowMs))flags.push("invalid_record");
 for(const r of records){
  if(!r.requestRef||!r.applicationRef||!Number.isFinite(Date.parse(r.receivedAt)))flags.push("invalid_record");
  if(r.stage==="requested"||r.stage==="under_review")flags.push("pending_review");
  if(r.stage==="awaiting_processor"||r.stage==="confirmed"&&!r.processorConfirmed)flags.push("incomplete_confirmation");
  if(r.legalHold||r.stage==="legal_hold")flags.push("legal_hold_review");
 }
 void biometricProviderStatus;
 return {enabled:false,pendingReview:flags.filter(x=>x==="pending_review").length,incompleteConfirmations:flags.filter(x=>x==="incomplete_confirmation").length,legalHoldReviews:flags.filter(x=>x==="legal_hold_review").length,flags};
}
/** Never connect this schematic view to the Commander Center without authorization and privacy review. */
