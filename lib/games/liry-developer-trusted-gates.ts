import type {DeveloperIdentityStatus,DeveloperAdmissionStatus} from "./liry-developer-identity-policy";

/** Preparatory trusted-event reducer. NOT connected to an identity provider or API.
 * Calling code must independently authenticate every provider webhook and staff action.
 * It must never accept claims directly from the applicant.
 */
export type TrustedDeveloperEvent=
 | {source:"verified_provider";kind:"identity_verified"|"identity_rejected"|"verification_expired";reference:string}
 | {source:"authorized_reviewer";kind:"rights_approved"|"rights_rejected";reference:string}
 | {source:"authorized_admissions";kind:"admission_approved"|"admission_rejected";reference:string};

export type DeveloperGateState={
 identity:DeveloperIdentityStatus;
 admission:DeveloperAdmissionStatus;
 rightsApproved:boolean;
};
export const INITIAL_DEVELOPER_GATE_STATE:Readonly<DeveloperGateState>={
 identity:"not_started",admission:"draft",rightsApproved:false
};

/** Fail closed until a real, authenticated provider and staff authorization exist. */
export function applyTrustedDeveloperEvent(
 current:Readonly<DeveloperGateState>,
 event:TrustedDeveloperEvent,
 context:{providerSignatureVerified:boolean;staffAuthorizationVerified:boolean;identityFeatureEnabled:boolean}
):DeveloperGateState{
 if(!context.identityFeatureEnabled||!event.reference.trim())return {...current};
 if(event.source==="verified_provider"){
  if(!context.providerSignatureVerified)return {...current};
  if(event.kind==="identity_verified")return {...current,identity:"identity_verified",admission:"rights_review"};
  if(event.kind==="identity_rejected")return {...current,identity:"identity_rejected",admission:"rejected",rightsApproved:false};
  return {...current,identity:"verification_expired",admission:"awaiting_identity",rightsApproved:false};
 }
 if(!context.staffAuthorizationVerified)return {...current};
 if(event.source==="authorized_reviewer"){
  if(current.identity!=="identity_verified")return {...current};
  if(event.kind==="rights_approved")return {...current,rightsApproved:true};
  return {...current,rightsApproved:false,admission:"rejected"};
 }
 if(event.kind==="admission_approved"){
  if(current.identity!=="identity_verified"||!current.rightsApproved||current.admission==="rejected")return {...current};
  return {...current,admission:"approved"};
 }
 return {...current,admission:"rejected"};
}
