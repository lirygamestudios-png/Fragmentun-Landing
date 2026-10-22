import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Offline audit specification; no writes, signatures, storage or live evidence. */
export type AuditDecision="incident_reviewed"|"remediation_confirmed"|"closure_approved"|"closure_denied";
export type AuditActorRole="authorized_security_reviewer"|"privacy_officer"|"platform_admin";
export type AdministrativeAuditEntry=Readonly<{entryId:string;incidentRef:string;sequence:number;previousDigest:string|null;digest:string;decision:AuditDecision;actorReference:string;actorRole:AuditActorRole;recordedAt:string;reasonCode:string;policyVersion:string;containsSensitiveData:false}>;
export type AdministrativeAuditAssessment=Readonly<{verified:false;reason:"integration_disabled"|"invalid_sequence"|"broken_chain"|"invalid_entry"|"requires_cryptographic_verification"}>;
const token=/^[A-Za-z0-9_-]{8,128}$/;
export function assessAdministrativeAuditChain(entries:readonly AdministrativeAuditEntry[]):AdministrativeAuditAssessment{
 if(biometricProviderStatus==="disabled")return {verified:false,reason:"integration_disabled"};
 for(let i=0;i<entries.length;i++){
  const item=entries[i];
  if(!token.test(item.entryId)||!token.test(item.incidentRef)||!item.actorReference||!item.reasonCode||!item.policyVersion||!Number.isFinite(Date.parse(item.recordedAt)))return {verified:false,reason:"invalid_entry"};
  if(item.sequence!==i+1)return {verified:false,reason:"invalid_sequence"};
  if(i>0&&(item.previousDigest!==entries[i-1].digest||item.incidentRef!==entries[i-1].incidentRef))return {verified:false,reason:"broken_chain"};
  if(i===0&&item.previousDigest!==null)return {verified:false,reason:"broken_chain"};
 }
 return {verified:false,reason:"requires_cryptographic_verification"};
}
/** Digest strings here are not verified hashes. Production needs server-side signatures, append-only storage and key rotation. */
