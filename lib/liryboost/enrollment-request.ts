/**
 * LiryBoost: contrato de solicitud previo a inscripción.
 * No registra usuarios, no persiste información ni constituye autorización.
 * La identidad y consentimiento se validarán contra fuentes servidor reales.
 */
export type LiryBoostEnrollmentRequest={
 participantId:unknown;
 publicAlias:unknown;
 acceptedRulesVersion:unknown;
 expectedRulesVersion:unknown;
 consentConfirmed:unknown;
};
export type LiryBoostEnrollmentReview=
 {accepted:false;reason:"invalid_participant"|"invalid_alias"|"invalid_rules"|"missing_consent"}|
 {accepted:true;reason:"request_valid_only"};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function reviewLiryBoostEnrollmentRequest(data:LiryBoostEnrollmentRequest):LiryBoostEnrollmentReview{
 if(typeof data?.participantId!=="string"||!UUID.test(data.participantId))
  return {accepted:false,reason:"invalid_participant"};
 if(typeof data.publicAlias!=="string"||!data.publicAlias.trim()||
    data.publicAlias.trim().length>60||/[<>@\r\n]/.test(data.publicAlias)||
    /https?:|www\./i.test(data.publicAlias))
  return {accepted:false,reason:"invalid_alias"};
 if(typeof data.acceptedRulesVersion!=="string"||!data.acceptedRulesVersion.trim()||
    typeof data.expectedRulesVersion!=="string"||!data.expectedRulesVersion.trim()||
    data.acceptedRulesVersion!==data.expectedRulesVersion)
  return {accepted:false,reason:"invalid_rules"};
 if(data.consentConfirmed!==true)return {accepted:false,reason:"missing_consent"};
 return {accepted:true,reason:"request_valid_only"};
}
