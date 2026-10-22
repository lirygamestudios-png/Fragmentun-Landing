import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Offline incident policy model. No incidents persisted, notifications dispatched or applicant data collected. */
export type IdentityIncidentKind="duplicate_provider_event"|"expired_provider_event"|"cross_application_mismatch"|"invalid_provider_signature"|"unauthorized_review_attempt"|"cancelled_case_event"|"unexpected_provider_status";
export type IncidentPriority="normal"|"high"|"critical";
export type IncidentStage="detected"|"triaged"|"under_review"|"resolved"|"dismissed";
export type IncidentAction="triage"|"assign"|"resolve"|"dismiss";
export type IncidentActor="system"|"authorized_security_reviewer"|"platform_admin";
export type IdentityIncidentRecord=Readonly<{incidentId:string;applicationReference:string;eventReference:string|null;kind:IdentityIncidentKind;priority:IncidentPriority;stage:IncidentStage;detectedAt:string;reasonCode:string;assignedReviewerRef:string|null}>;
export type IncidentActionAssessment=Readonly<{permitted:false;reason:"integration_disabled"|"invalid_incident"|"not_authorized"|"invalid_transition"|"requires_secure_audit_storage"}>;
const identifier=/^[A-Za-z0-9_-]{8,128}$/;
const transitions:Readonly<Record<IncidentStage,Partial<Record<IncidentAction,IncidentStage>>>>={
 detected:{triage:"triaged"},triaged:{assign:"under_review"},under_review:{resolve:"resolved",dismiss:"dismissed"},resolved:{},dismissed:{}
};
export function assessIncidentAction(record:IdentityIncidentRecord,action:IncidentAction,actor:IncidentActor):IncidentActionAssessment{
 if(biometricProviderStatus==="disabled")return {permitted:false,reason:"integration_disabled"};
 if(!identifier.test(record.incidentId)||!identifier.test(record.applicationReference)||!record.reasonCode)return {permitted:false,reason:"invalid_incident"};
 if(actor!=="authorized_security_reviewer")return {permitted:false,reason:"not_authorized"};
 if(!transitions[record.stage][action])return {permitted:false,reason:"invalid_transition"};
 return {permitted:false,reason:"requires_secure_audit_storage"};
}
/** Future production requires authenticated case binding, role checks, tamper-resistant audit and retention controls. */
