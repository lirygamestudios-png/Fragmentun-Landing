/** Comprobación pura previa a una futura inscripción. No accede a Auth ni escribe datos. */
import {validateEnrollmentOwnership} from "./enrollment-ownership.ts";
import {matchesEnrollmentIdentity,type TrustedIdentity} from "./trusted-identity-match.ts";
import type {LiryBoostEnrollmentDraft} from "./enrollment-validation.ts";
import type {EnrollmentIdentityState} from "./enrollment-email-gates.ts";
import type {ConsentRecord} from "./enrollment-consent-gates.ts";
export function assessTrustedEnrollment(input:{trustedIdentity:TrustedIdentity|null;draft:LiryBoostEnrollmentDraft;identity:EnrollmentIdentityState;consent:ConsentRecord|null;rulesVersion:string;privacyVersion:string;now:number}){
 if(!input.trustedIdentity||!matchesEnrollmentIdentity(input.trustedIdentity,{userId:input.identity.currentUserId??"",email:input.draft.email}))return "identity_unverified" as const;
 return validateEnrollmentOwnership({...input,authenticatedUserId:input.trustedIdentity.userId});
}
