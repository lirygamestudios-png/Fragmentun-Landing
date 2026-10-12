/** LiryBoost: interpretación de la competencia por un mismo invitado.
 * No adjudica ganadores ni realiza operaciones atómicas: solo comprueba una
 * decisión ya registrada por PostgreSQL.
 */
export type InviteeClaimResult={source:unknown;committed:unknown;status:unknown;claimedInviteeId:unknown;winningReferrerId:unknown};
export function reviewInviteeClaim(
 inviteeId:unknown,referrerId:unknown,result:InviteeClaimResult
):{credited:boolean;reason:"won"|"already_claimed"|"unconfirmed"}{
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 if(typeof inviteeId!=="string"||typeof referrerId!=="string"||!uuid.test(inviteeId)||!uuid.test(referrerId)||
  inviteeId.toLowerCase()===referrerId.toLowerCase()||
  !result||result.source!=="central_database"||result.committed!==true||
  typeof result.claimedInviteeId!=="string"||result.claimedInviteeId.toLowerCase()!==inviteeId.toLowerCase())
  return {credited:false,reason:"unconfirmed"};
 if(result.status==="already_claimed")return {credited:false,reason:"already_claimed"};
 if(result.status!=="won"||typeof result.winningReferrerId!=="string"||
  result.winningReferrerId.toLowerCase()!==referrerId.toLowerCase())
  return {credited:false,reason:"unconfirmed"};
 return {credited:true,reason:"won"};
}
