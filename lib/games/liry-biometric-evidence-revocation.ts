import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Offline revocation and access-attempt policy. No live downloads, tokens, logs or notifications. */
export type EvidenceAccessOutcome="revoked"|"expired"|"unknown_recipient"|"access_limit"|"legal_hold"|"eligible_but_disabled";
export type EvidenceGrantSnapshot=Readonly<{grantRef:string;recipientRef:string;state:"approved"|"revoked"|"expired";expiresAt:string;maxAccessCount:number;usedAccessCount:number;legalHold:boolean}>;
export type EvidenceAttempt=Readonly<{grantRef:string;actingRecipientRef:string;attemptedAt:string;outcome:EvidenceAccessOutcome;containsSensitiveData:false}>;
export type EvidenceAccessEvaluation=Readonly<{permitted:false;outcome:EvidenceAccessOutcome;logged:false}>;
export function evaluateEvidenceAccess(grant:EvidenceGrantSnapshot,recipientRef:string,nowMs:number):EvidenceAccessEvaluation{
 let outcome:EvidenceAccessOutcome="eligible_but_disabled";
 if(grant.state==="revoked")outcome="revoked";
 else if(grant.state==="expired"||!Number.isFinite(nowMs)||!Number.isFinite(Date.parse(grant.expiresAt))||Date.parse(grant.expiresAt)<=nowMs)outcome="expired";
 else if(!recipientRef||recipientRef!==grant.recipientRef)outcome="unknown_recipient";
 else if(!Number.isSafeInteger(grant.usedAccessCount)||!Number.isSafeInteger(grant.maxAccessCount)||grant.usedAccessCount<0||grant.maxAccessCount<1||grant.usedAccessCount>=grant.maxAccessCount)outcome="access_limit";
 else if(grant.legalHold)outcome="legal_hold";
 void biometricProviderStatus;
 return {permitted:false,outcome,logged:false};
}
/** Real enforcement requires atomic persisted revocation and counter checks plus authenticated, tamper-evident access logs. */
