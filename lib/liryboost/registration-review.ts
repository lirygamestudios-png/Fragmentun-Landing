/**
 * LiryBoost: evaluación conjunta de un registro futuro, sin efectos secundarios.
 * Las entradas serverContext deben provenir de comprobaciones confiables del servidor;
 * no son prueba de autenticación por sí mismas.
 * NO crea participantes, ni abre la inscripción.
 */
import {reviewLiryBoostEnrollmentRequest,type LiryBoostEnrollmentRequest} from "./enrollment-request.ts";
import {checkEnrollmentIdentityBinding,type EnrollmentIdentityBinding} from "./enrollment-identity.ts";
import {checkLiryBoostRegistrationReadiness,type LiryBoostRegistrationReadiness} from "./registration-readiness.ts";
import {reviewLiryBoostConsentEvidence,type LiryBoostConsentEvidence} from "./consent-evidence.ts";

export type LiryBoostRegistrationDecision=
 {processable:false;stage:"launch_gate"|"request"|"identity"|"consent";reason:string}|
 {processable:true;stage:"precheck_only";reason:"requires_server_transaction"};

export function reviewLiryBoostRegistration(
 request:LiryBoostEnrollmentRequest,
 serverIdentity:EnrollmentIdentityBinding,
 serverReadiness:LiryBoostRegistrationReadiness,
 serverPublishedRulesVersion:unknown,
 serverParticipantId:unknown,
 serverConsentEvidence:LiryBoostConsentEvidence
):LiryBoostRegistrationDecision{
 const gate=checkLiryBoostRegistrationReadiness(serverReadiness);
 if(!gate.ready)return {processable:false,stage:"launch_gate",reason:"program_not_authorized"};
 // La versión vigente debe venir del servidor; nunca confiar en expectedRulesVersion del visitante.
 if(typeof serverPublishedRulesVersion!=="string"||!serverPublishedRulesVersion.trim()||request?.acceptedRulesVersion!==serverPublishedRulesVersion)
  return {processable:false,stage:"request",reason:"invalid_rules"};
 // El participante solicitado debe ser el registro asociado por el servidor al usuario autenticado.
 if(typeof serverParticipantId!=="string"||typeof request?.participantId!=="string"||
    request.participantId.toLowerCase()!==serverParticipantId.toLowerCase())
  return {processable:false,stage:"request",reason:"participant_mismatch"};
 const input=reviewLiryBoostEnrollmentRequest({...request,expectedRulesVersion:serverPublishedRulesVersion});
 if(!input.accepted)return {processable:false,stage:"request",reason:input.reason};
 const identity=checkEnrollmentIdentityBinding(serverIdentity);
 if(!identity.bound)return {processable:false,stage:"identity",reason:identity.reason};
 const consent=reviewLiryBoostConsentEvidence(serverConsentEvidence);
 if(!consent.valid)return {processable:false,stage:"consent",reason:consent.reason};
 if(serverConsentEvidence.authenticatedUserId.toLowerCase()!==serverIdentity.authenticatedUserId.toLowerCase()||
    serverConsentEvidence.acceptedRulesVersion!==serverPublishedRulesVersion)
  return {processable:false,stage:"consent",reason:"evidence_mismatch"};
 return {processable:true,stage:"precheck_only",reason:"requires_server_transaction"};
}
