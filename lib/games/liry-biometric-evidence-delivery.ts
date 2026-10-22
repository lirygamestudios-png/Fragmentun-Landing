import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Offline delivery authorization blueprint; no signed URLs, downloads, storage or messages. */
export type EvidenceDeliveryState="requested"|"approved"|"revoked"|"expired"|"access_confirmed";
export type EvidenceDeliveryAction="approve"|"revoke"|"confirm_access";
export type EvidenceDeliveryActor="privacy_officer"|"authorized_recipient"|"authorized_security_reviewer";
export type EvidenceDeliveryGrant=Readonly<{grantRef:string;evidenceRef:string;recipientRef:string;requesterRef:string;approverRef:string|null;state:EvidenceDeliveryState;issuedAt:string;expiresAt:string;accessCount:number;maxAccessCount:number;legalHold:boolean;purposeCode:string}>;
export type EvidenceDeliveryDecision=Readonly<{allowed:false;reason:"service_disabled"|"invalid_grant"|"expired_grant"|"access_limit_reached"|"legal_hold_review"|"wrong_actor"|"separation_of_duties"|"invalid_transition"|"requires_authenticated_delivery"}>;
export function assessEvidenceDelivery(grant:EvidenceDeliveryGrant,action:EvidenceDeliveryAction,actor:EvidenceDeliveryActor,actingRef:string,nowMs:number):EvidenceDeliveryDecision{
 if(biometricProviderStatus==="disabled")return {allowed:false,reason:"service_disabled"};
 if(!grant.grantRef||!grant.evidenceRef||!grant.recipientRef||!grant.purposeCode||!Number.isFinite(nowMs)||!Number.isInteger(grant.accessCount)||!Number.isInteger(grant.maxAccessCount)||grant.maxAccessCount<1||grant.accessCount<0)return {allowed:false,reason:"invalid_grant"};
 const start=Date.parse(grant.issuedAt),end=Date.parse(grant.expiresAt);
 if(!Number.isFinite(start)||!Number.isFinite(end)||nowMs<start||end<=nowMs||end<=start)return {allowed:false,reason:"expired_grant"};
 if(grant.legalHold)return {allowed:false,reason:"legal_hold_review"};
 if(action==="approve"&&(actor!=="privacy_officer"||grant.requesterRef===actingRef))return {allowed:false,reason:"separation_of_duties"};
 if(action==="confirm_access"&&(actor!=="authorized_recipient"||grant.recipientRef!==actingRef))return {allowed:false,reason:"wrong_actor"};
 if(action==="revoke"&&actor!=="privacy_officer")return {allowed:false,reason:"wrong_actor"};
 if(grant.accessCount>=grant.maxAccessCount&&action==="confirm_access")return {allowed:false,reason:"access_limit_reached"};
 if(action==="approve"&&grant.state!=="requested"||action==="revoke"&&grant.state!=="approved"||action==="confirm_access"&&grant.state!=="approved")return {allowed:false,reason:"invalid_transition"};
 return {allowed:false,reason:"requires_authenticated_delivery"};
}
/** Production needs authenticated recipient, one-time scoped URLs, revocation persistence, proof-of-access and immutable logs. */
