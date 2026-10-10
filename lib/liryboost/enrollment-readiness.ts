/** Resultado puro del proceso de inscripción futura. No ejecuta llamadas ni escrituras. */
import {validateLiryBoostEnrollment,type LiryBoostEnrollmentDraft} from "./enrollment-validation.ts";
import {canFinalizeLiryBoostEnrollment,type EnrollmentIdentityState} from "./enrollment-email-gates.ts";
import {evaluateLiryBoostConsent,type ConsentRecord} from "./enrollment-consent-gates.ts";
export type EnrollmentReadiness="ready_for_transaction"|"invalid_fields"|"identity_unverified"|"consent_missing";
export function evaluateEnrollmentReadiness(input:{draft:LiryBoostEnrollmentDraft;identity:EnrollmentIdentityState;consent:ConsentRecord|null;rulesVersion:string;privacyVersion:string;now:number}):EnrollmentReadiness{
 if(!validateLiryBoostEnrollment(input.draft).valid)return "invalid_fields";
 if(!canFinalizeLiryBoostEnrollment(input.identity))return "identity_unverified";
 if(!evaluateLiryBoostConsent(input.consent,{rulesVersion:input.rulesVersion,privacyVersion:input.privacyVersion},input.now).registrationAllowed)return "consent_missing";
 return "ready_for_transaction";
}
