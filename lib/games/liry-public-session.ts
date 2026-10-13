/** Contrato de sesión pública LIRY ID. No establece ni valida sesiones.
 * La identidad administrativa no puede autorizar sesiones gamer.
 */
export type LirySessionEvidence={
 source:unknown; userId:unknown; emailConfirmed:unknown;
 sessionVerified:unknown; audience:unknown; expiresAt:unknown;
};
export function reviewLiryPublicSession(evidence:LirySessionEvidence,now=Date.now()):
 {authorized:boolean;reason:"verified_gamer_session"|"unverified"}{
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 const until=evidence?.expiresAt;
 if(!evidence||evidence.source!=="trusted_server"||evidence.audience!=="lirygames_public"||
  evidence.sessionVerified!==true||evidence.emailConfirmed!==true||
  typeof evidence.userId!=="string"||!uuid.test(evidence.userId)||
  typeof until!=="number"||!Number.isSafeInteger(until)||until<=now||
  until>now+24*60*60*1000)
  return {authorized:false,reason:"unverified"};
 return {authorized:true,reason:"verified_gamer_session"};
}
