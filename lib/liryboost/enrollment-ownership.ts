/** Guarda final pura antes de cualquier futura escritura de inscripción. */
import {evaluateEnrollmentReadiness,type EnrollmentReadiness} from "./enrollment-readiness.ts";
import type {LiryBoostEnrollmentDraft} from "./enrollment-validation.ts";
import type {EnrollmentIdentityState} from "./enrollment-email-gates.ts";
import type {ConsentRecord} from "./enrollment-consent-gates.ts";
export function validateEnrollmentOwnership(input:{draft:LiryBoostEnrollmentDraft;identity:EnrollmentIdentityState;consent:ConsentRecord|null;rulesVersion:string;privacyVersion:string;now:number;authenticatedUserId:string|null}):EnrollmentReadiness{
 if(!input.authenticatedUserId?.trim()||input.authenticatedUserId!==input.identity.currentUserId)return "identity_unverified";
 return evaluateEnrollmentReadiness(input);
}
