import type {DeveloperIdentityStatus,DeveloperAdmissionStatus} from "./liry-developer-identity-policy";

/** Policy simulator only. NOT an API or authorization boundary.
 * A future backend must authenticate provider callbacks, bind sessions to
 * applicants, enforce one-time events, and check distinct staff privileges.
 */
export type TrustedDeveloperEvent=
 | {source:"verified_provider";kind:"identity_verified"|"identity_rejected"|"verification_expired";reference:string}
 | {source:"authorized_reviewer";kind:"rights_approved"|"rights_rejected";reference:string}
 | {source:"authorized_payouts";kind:"bank_verified"|"bank_rejected";reference:string}
 | {source:"authorized_admissions";kind:"admission_approved"|"admission_rejected";reference:string};

export type DeveloperGateState={
 identity:DeveloperIdentityStatus;
 admission:DeveloperAdmissionStatus;
 rightsApproved:boolean;
 bankVerified:boolean;
};
export const INITIAL_DEVELOPER_GATE_STATE:Readonly<DeveloperGateState>={
 identity:"not_started",admission:"draft",rightsApproved:false,bankVerified:false
};
export type TrustedDeveloperContext={
 providerSignatureVerified:boolean;
 staffAuthorizationVerified:boolean;
 bankAuthorityVerified:boolean;
 identityFeatureEnabled:boolean;
};

/** All approvals fail closed. An uploaded bank statement is not bank validation. */
export function applyTrustedDeveloperEvent(
 current:Readonly<DeveloperGateState>,
 event:TrustedDeveloperEvent,
 context:TrustedDeveloperContext
):DeveloperGateState{
 if(!context.identityFeatureEnabled||!event.reference.trim()||current.admission==="rejected")
  return {...current};
 if(event.source==="verified_provider"){
  if(!context.providerSignatureVerified)return {...current};
  if(event.kind==="identity_verified")
   return {...current,identity:"identity_verified",admission:"rights_review"};
  if(event.kind==="identity_rejected")
   return {...current,identity:"identity_rejected",admission:"rejected",rightsApproved:false,bankVerified:false};
  return {...current,identity:"verification_expired",admission:"awaiting_identity",rightsApproved:false,bankVerified:false};
 }
 if(event.source==="authorized_payouts"){
  if(!context.bankAuthorityVerified||current.identity!=="identity_verified")return {...current};
  if(event.kind==="bank_verified")return {...current,bankVerified:true};
  return {...current,bankVerified:false,admission:"rejected"};
 }
 if(!context.staffAuthorizationVerified)return {...current};
 if(event.source==="authorized_reviewer"){
  if(current.identity!=="identity_verified")return {...current};
  if(event.kind==="rights_approved")return {...current,rightsApproved:true};
  return {...current,rightsApproved:false,admission:"rejected"};
 }
 if(event.kind==="admission_approved"){
  if(current.identity!=="identity_verified"||!current.rightsApproved||!current.bankVerified)
   return {...current};
  return {...current,admission:"approved"};
 }
 return {...current,admission:"rejected"};
}
