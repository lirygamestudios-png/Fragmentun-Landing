/**
 * LiryBoost: evaluación conjunta de un registro futuro, sin efectos secundarios.
 * Las entradas serverContext deben provenir de comprobaciones confiables del servidor;
 * no son prueba de autenticación por sí mismas.
 * NO crea participantes, ni abre la inscripción.
 */
import {reviewLiryBoostEnrollmentRequest,type LiryBoostEnrollmentRequest} from "./enrollment-request";
import {checkEnrollmentIdentityBinding,type EnrollmentIdentityBinding} from "./enrollment-identity";
import {checkLiryBoostRegistrationReadiness,type LiryBoostRegistrationReadiness} from "./registration-readiness";

export type LiryBoostRegistrationDecision=
 {processable:false;stage:"launch_gate"|"request"|"identity";reason:string}|
 {processable:true;stage:"precheck_only";reason:"requires_server_transaction"};

export function reviewLiryBoostRegistration(
 request:LiryBoostEnrollmentRequest,
 serverIdentity:EnrollmentIdentityBinding,
 serverReadiness:LiryBoostRegistrationReadiness
):LiryBoostRegistrationDecision{
 const gate=checkLiryBoostRegistrationReadiness(serverReadiness);
 if(!gate.ready)return {processable:false,stage:"launch_gate",reason:"program_not_authorized"};
 const input=reviewLiryBoostEnrollmentRequest(request);
 if(!input.accepted)return {processable:false,stage:"request",reason:input.reason};
 const identity=checkEnrollmentIdentityBinding(serverIdentity);
 if(!identity.bound)return {processable:false,stage:"identity",reason:identity.reason};
 return {processable:true,stage:"precheck_only",reason:"requires_server_transaction"};
}
