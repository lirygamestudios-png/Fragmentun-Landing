import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Offline evidence custody specification. No storage, exports, credentials or live access. */
export type CustodyRole="authorized_security_reviewer"|"privacy_officer"|"platform_admin"|"applicant";
export type CustodyAction="inspect_metadata"|"request_export"|"authorize_export"|"execute_export"|"audit_access";
export type CustodyRecord=Readonly<{evidenceRef:string;incidentRef:string;classification:"restricted"|"highly_restricted";legalHold:boolean;exportRequestRef:string|null;requesterRef:string;approverRef:string|null;accessReasonCode:string;policyVersion:string}>;
export type CustodyDecision=Readonly<{permitted:false;reason:"service_disabled"|"invalid_record"|"role_not_authorized"|"separation_of_duties"|"legal_hold_review"|"requires_secure_audited_server"}>;
const permissions:Readonly<Record<CustodyRole,readonly CustodyAction[]>>={
 authorized_security_reviewer:["inspect_metadata","request_export"],
 privacy_officer:["inspect_metadata","authorize_export","audit_access"],
 platform_admin:["audit_access"],
 applicant:[]
};
export function assessEvidenceCustody(record:CustodyRecord,role:CustodyRole,action:CustodyAction):CustodyDecision{
 if(biometricProviderStatus==="disabled")return {permitted:false,reason:"service_disabled"};
 if(!record.evidenceRef||!record.incidentRef||!record.accessReasonCode||!record.policyVersion)return {permitted:false,reason:"invalid_record"};
 if(!permissions[role].includes(action))return {permitted:false,reason:"role_not_authorized"};
 if(action==="authorize_export"&&record.requesterRef===record.approverRef)return {permitted:false,reason:"separation_of_duties"};
 if(record.legalHold&&(action==="authorize_export"||action==="request_export"))return {permitted:false,reason:"legal_hold_review"};
 return {permitted:false,reason:"requires_secure_audited_server"};
}
/** Real export requires authenticated access, dual authorization, narrowly scoped disclosures and immutable access audit. */
