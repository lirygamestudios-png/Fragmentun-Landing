import {biometricProviderStatus} from "./liry-biometric-readiness";
import type {ProviderEventEnvelope} from "./liry-biometric-provider-envelope";
/** Pure model for cross-application isolation, not a live webhook/DB lookup. */
export type TrustedIdentitySession=Readonly<{applicationId:string;providerReference:string;sessionId:string;applicantId:string;expiresAt:string;status:"pending"|"closed"}>;
export type IdentityBindingResult=Readonly<{authorized:false;reason:"integration_disabled"|"invalid_binding"|"expired_session"|"session_closed"|"requires_authenticated_server"}>;
const id=/^[A-Za-z0-9_-]{8,128}$/;
export function checkIdentityEventBinding(event:ProviderEventEnvelope,session:TrustedIdentitySession,authenticatedApplicantId:string,nowMs:number):IdentityBindingResult{
 if(biometricProviderStatus==="disabled")return {authorized:false,reason:"integration_disabled"};
 if(!id.test(authenticatedApplicantId)||!id.test(session.sessionId)||event.applicationId!==session.applicationId||event.providerReference!==session.providerReference||authenticatedApplicantId!==session.applicantId)return {authorized:false,reason:"invalid_binding"};
 if(session.status!=="pending")return {authorized:false,reason:"session_closed"};
 const expires=Date.parse(session.expiresAt);
 if(!Number.isFinite(expires)||!Number.isFinite(nowMs)||expires<=nowMs)return {authorized:false,reason:"expired_session"};
 return {authorized:false,reason:"requires_authenticated_server"};
}
/** Real processing must additionally verify signed provider events, persisted nonce, idempotency and case ownership. */
