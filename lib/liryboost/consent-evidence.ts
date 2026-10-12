/**
 * Evidencia mínima de consentimiento para LiryBoost, solo prevalidación.
 * La evidencia DEBE proceder de registro de servidor autenticado y persistido.
 * Esta función no persiste consentimientos ni autoriza inscripciones.
 */
export type LiryBoostConsentEvidence={
 participantOwnerUserId:unknown;
 authenticatedUserId:unknown;
 acceptedRulesVersion:unknown;
 publishedRulesVersion:unknown;
 consentRecordedAt:unknown;
 consentRevokedAt:unknown;
};
export function reviewLiryBoostConsentEvidence(e:LiryBoostConsentEvidence):
 {valid:false;reason:"identity_mismatch"|"rules_mismatch"|"no_record"|"revoked"}|
 {valid:true;reason:"evidence_precheck_only"} {
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 if(typeof e?.authenticatedUserId!=="string"||typeof e.participantOwnerUserId!=="string"||
    !uuid.test(e.authenticatedUserId)||!uuid.test(e.participantOwnerUserId)||
    e.authenticatedUserId.toLowerCase()!==e.participantOwnerUserId.toLowerCase())
  return {valid:false,reason:"identity_mismatch"};
 if(typeof e.acceptedRulesVersion!=="string"||!e.acceptedRulesVersion.trim()||
    e.acceptedRulesVersion!==e.publishedRulesVersion)
  return {valid:false,reason:"rules_mismatch"};
 if(typeof e.consentRecordedAt!=="string"||!Number.isFinite(Date.parse(e.consentRecordedAt)))
  return {valid:false,reason:"no_record"};
 if(e.consentRevokedAt!==null&&e.consentRevokedAt!==undefined)
  return {valid:false,reason:"revoked"};
 return {valid:true,reason:"evidence_precheck_only"};
}
