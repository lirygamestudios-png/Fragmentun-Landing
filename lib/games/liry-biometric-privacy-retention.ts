import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Privacy design model only. No identity documents, facial images, storage or deletion endpoints. */
export type IdentityRecordKind="verification_reference"|"decision_summary"|"consent_receipt"|"audit_metadata";
export type IdentityPrivacyRole="applicant"|"authorized_identity_reviewer"|"privacy_officer"|"platform_admin";
export type IdentityPrivacyAction="read_own_status"|"review_result"|"inspect_audit"|"request_erasure"|"approve_erasure"|"execute_erasure";
export type IdentityRetentionPolicy=Readonly<{policyVersion:string;retentionDays:number;legalHold:boolean;reviewedByPrivacyOfficer:boolean}>;
export type IdentityPrivacyRequest=Readonly<{applicationId:string;requesterId:string;actorRole:IdentityPrivacyRole;action:IdentityPrivacyAction;recordKind:IdentityRecordKind;createdAt:string;ownerMatches:boolean}>;
export type IdentityPrivacyAssessment=Readonly<{allowed:false;reason:"service_disabled"|"unapproved_policy"|"invalid_policy"|"role_mismatch"|"requires_secure_server"}>;
const permissions:Readonly<Record<IdentityPrivacyRole,readonly IdentityPrivacyAction[]>>={
 applicant:["read_own_status","request_erasure"],
 authorized_identity_reviewer:["review_result"],
 privacy_officer:["inspect_audit","approve_erasure"],
 platform_admin:[]
};
export function assessIdentityPrivacyAccess(request:IdentityPrivacyRequest,policy:IdentityRetentionPolicy,nowMs:number):IdentityPrivacyAssessment{
 if(biometricProviderStatus==="disabled")return {allowed:false,reason:"service_disabled"};
 if(!policy.policyVersion||!Number.isSafeInteger(policy.retentionDays)||policy.retentionDays<1||!policy.reviewedByPrivacyOfficer||!Number.isFinite(nowMs)||!Number.isFinite(Date.parse(request.createdAt)))return {allowed:false,reason:"unapproved_policy"};
 if(!request.ownerMatches&&request.actorRole==="applicant")return {allowed:false,reason:"role_mismatch"};
 if(!permissions[request.actorRole].includes(request.action))return {allowed:false,reason:"role_mismatch"};
 if(policy.legalHold&&request.action==="approve_erasure")return {allowed:false,reason:"invalid_policy"};
 return {allowed:false,reason:"requires_secure_server"};
}
/** Retention duration must be established by legal review; never use an invented default. */
