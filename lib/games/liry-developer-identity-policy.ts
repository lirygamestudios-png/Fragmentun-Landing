/** Liry Developers identity-verification release policy.
 * No biometric data, document images or account credentials belong here.
 * This module models server-authoritative statuses; it DOES NOT verify identity.
 */
export const LIRY_DEVELOPER_IDV_ENABLED=false as const;
export type DeveloperIdentityStatus=
 | "not_started"
 | "consent_required"
 | "provider_pending"
 | "in_review"
 | "additional_information_required"
 | "identity_verified"
 | "identity_rejected"
 | "verification_expired";
export type DeveloperAdmissionStatus=
 | "draft"|"awaiting_identity"|"identity_review"|"rights_review"|"approved"|"rejected";

export type DeveloperVerificationRecord={
 applicantId:string;
 providerSessionReference:string|null;
 identityStatus:DeveloperIdentityStatus;
 admissionStatus:DeveloperAdmissionStatus;
 updatedAt:string;
};
export type DeveloperVerificationView={
 identityStatus:DeveloperIdentityStatus;
 admissionStatus:DeveloperAdmissionStatus;
 canRequestVerification:boolean;
 canPublish:boolean;
 explanation:string;
};

/** Never infer verification from local inputs or from an untrusted provider callback. */
export function projectDeveloperVerificationView(record:DeveloperVerificationRecord|null):DeveloperVerificationView{
 if(!record)return{identityStatus:"not_started",admissionStatus:"draft",canRequestVerification:false,canPublish:false,explanation:"Verification is not enabled."};
 return {
  identityStatus:record.identityStatus,
  admissionStatus:record.admissionStatus,
  canRequestVerification:false,
  // Even a 'verified' identity does not authorize releasing a game.
  canPublish:false,
  explanation:LIRY_DEVELOPER_IDV_ENABLED?"Provider and editorial approval required.":"Verification is not enabled."
 };
}
