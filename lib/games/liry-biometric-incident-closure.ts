import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Offline critical incident closure policy only; no operational updates or sensitive evidence. */
export type CriticalIncidentStage="detected"|"under_review"|"remediation_pending"|"closure_requested"|"closed";
export type ClosureActor="authorized_security_reviewer"|"privacy_officer"|"platform_admin";
export type ClosureEvidence=Readonly<{incidentRef:string;reasonCode:string;remediationReference:string;reviewerReference:string;approverReference:string;reviewedAt:string;approvedAt:string;containsSensitiveData:false}>;
export type CriticalIncident=Readonly<{incidentRef:string;stage:CriticalIncidentStage;severity:"high"|"critical";ownerRole:"authorized_security_reviewer"|"privacy_officer";legalHold:boolean}>;
export type ClosureAssessment=Readonly<{permitted:false;reason:"integration_disabled"|"incomplete_evidence"|"not_ready"|"separation_of_duties"|"legal_hold_review"|"requires_secure_audit"}>;
const validRef=/^[A-Za-z0-9_-]{8,128}$/;
export function assessIncidentClosure(incident:CriticalIncident,evidence:ClosureEvidence,reviewer:ClosureActor,approver:ClosureActor):ClosureAssessment{
 if(biometricProviderStatus==="disabled")return {permitted:false,reason:"integration_disabled"};
 if(incident.stage!=="closure_requested")return {permitted:false,reason:"not_ready"};
 if(incident.legalHold)return {permitted:false,reason:"legal_hold_review"};
 if(!validRef.test(incident.incidentRef)||incident.incidentRef!==evidence.incidentRef||!evidence.reasonCode||!evidence.remediationReference||!evidence.reviewedAt||!evidence.approvedAt)return {permitted:false,reason:"incomplete_evidence"};
 if(reviewer!==incident.ownerRole||approver!=="platform_admin"||evidence.reviewerReference===evidence.approverReference)return {permitted:false,reason:"separation_of_duties"};
 return {permitted:false,reason:"requires_secure_audit"};
}
/** Real closure requires authenticated identities, immutable audit and independent authorization. */
