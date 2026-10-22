import {biometricProviderStatus,mayApproveDeveloper,type AdmissionGates,type IdentityDecision} from "./liry-biometric-readiness";

/** Internal review model only. No applicant data, provider session, database, or API. */
export type ReviewEvent = "submit" | "provider_verified" | "provider_inconclusive" | "provider_rejected" | "expire" | "reopen";
export type VerificationAuditEntry = Readonly<{event:ReviewEvent; from:IdentityDecision; to:IdentityDecision; at:string; reviewerRole:"system"|"authorized_reviewer"}>;
const transitions:Readonly<Record<IdentityDecision,Partial<Record<ReviewEvent,IdentityDecision>>>>={
 not_started:{submit:"pending"},
 pending:{provider_verified:"verified",provider_inconclusive:"needs_review",provider_rejected:"rejected",expire:"expired"},
 verified:{expire:"expired",reopen:"needs_review"},
 needs_review:{provider_verified:"verified",provider_rejected:"rejected",expire:"expired"},
 rejected:{reopen:"needs_review"},
 expired:{reopen:"needs_review"}
};
export function evaluateReviewTransition(current:IdentityDecision,event:ReviewEvent,role:"system"|"authorized_reviewer"):IdentityDecision|null {
 if(biometricProviderStatus!=="disabled")return null; // demo model cannot act in live mode
 if(event==="reopen"&&role!=="authorized_reviewer")return null;
 return transitions[current][event]??null;
}
export function describeOnboardingGates(gates:AdmissionGates):Readonly<{identity:boolean;ip:boolean;bank:boolean;safety:boolean;manual:boolean;mayApprove:boolean}>{
 return {identity:gates.identity==="verified",ip:gates.intellectualPropertyApproved,bank:gates.bankBeneficiaryVerified,safety:gates.ageAndSafetyReviewed,manual:gates.manualDeveloperApproval,mayApprove:mayApproveDeveloper(gates)};
}
/** Never turn the demo transitions into real status writes or approvals. */
