/**
 * Reglas puras y conservadoras para PREVALIDAR atribuciones LiryBoost.
 * No verifica identidad humana, no consulta datos y NO concede puntos.
 * La exclusividad del invitado debe reforzarse con una restricción UNIQUE
 * y transacciones del lado del servidor antes de habilitar el programa.
 */
export type LiryBoostAttributionCandidate={
 inviterId:string;
 inviteeId:string;
 verifiedInvitee:boolean;
 participationConsented:boolean;
 inviterEligible:boolean;
};
export type LiryBoostPrecheckResult=
 {eligible:false;reason:"invalid_identity"|"self_referral"|"not_verified"|"missing_consent"|"inviter_not_eligible"|"duplicate_invitee"}|
 {eligible:true;reason:"precheck_only"};

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function precheckLiryBoostAttribution(
 candidate:LiryBoostAttributionCandidate,
 alreadyAttributedInviteeIds:ReadonlySet<string>
):LiryBoostPrecheckResult{
 const inviter=typeof candidate.inviterId==="string"?candidate.inviterId.toLowerCase():"";
 const invitee=typeof candidate.inviteeId==="string"?candidate.inviteeId.toLowerCase():"";
 if(!inviter||!invitee||!UUID.test(inviter)||!UUID.test(invitee))
  return {eligible:false,reason:"invalid_identity"};
 if(inviter===invitee)return {eligible:false,reason:"self_referral"};
 if(candidate.verifiedInvitee!==true)return {eligible:false,reason:"not_verified"};
 if(candidate.participationConsented!==true)return {eligible:false,reason:"missing_consent"};
 if(candidate.inviterEligible!==true)return {eligible:false,reason:"inviter_not_eligible"};
 if([...alreadyAttributedInviteeIds].some(id=>typeof id==="string"&&id.toLowerCase()===invitee))
  return {eligible:false,reason:"duplicate_invitee"};
 return {eligible:true,reason:"precheck_only"};
}
