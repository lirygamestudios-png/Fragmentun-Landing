/** LiryBoost: validación de resultado de atribución confirmado por un adaptador futuro.
 * No escribe en la base de datos ni acredita invitaciones; solo interpreta
 * evidencia que deberá originarse de una transacción autenticada y atómica.
 */
export type VerifiedAttributionOutcome={
 source:unknown;
 confirmed:unknown;
 status:unknown;
 referrerUserId:unknown;
 inviteeUserId:unknown;
};
export function reviewVerifiedAttributionOutcome(
 authenticatedReferrerId:unknown,
 verifiedInviteeId:unknown,
 outcome:VerifiedAttributionOutcome
):{creditable:boolean;reason:"confirmed"|"duplicate"|"rejected"|"unverified"}{
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 if(typeof authenticatedReferrerId!=="string"||typeof verifiedInviteeId!=="string"||
    !uuid.test(authenticatedReferrerId)||!uuid.test(verifiedInviteeId)||
    authenticatedReferrerId.toLowerCase()===verifiedInviteeId.toLowerCase()||
    !outcome||outcome.source!=="central_database"||outcome.confirmed!==true||
    typeof outcome.referrerUserId!=="string"||typeof outcome.inviteeUserId!=="string"||
    outcome.referrerUserId.toLowerCase()!==authenticatedReferrerId.toLowerCase()||
    outcome.inviteeUserId.toLowerCase()!==verifiedInviteeId.toLowerCase())
  return {creditable:false,reason:"unverified"};
 if(outcome.status==="duplicate")return {creditable:false,reason:"duplicate"};
 if(outcome.status==="rejected")return {creditable:false,reason:"rejected"};
 if(outcome.status!=="committed")return {creditable:false,reason:"unverified"};
 return {creditable:true,reason:"confirmed"};
}
