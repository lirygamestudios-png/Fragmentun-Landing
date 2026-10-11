/** Comprobación de forma para invitaciones futuras; NO acredita referidos. */
export type InvitationCandidate={invitationId:string;referrerId:string;inviteeId:string;verified:boolean;consent:boolean};
const safeId=/^[a-zA-Z0-9_-]{8,80}$/;
export function inspectInvitationBatch(input:unknown):"invalid"|"self_referral"|"duplicate"|"unverified"|"eligible_for_server_review"{
 if(!Array.isArray(input)||input.length===0||input.length>100)return "invalid";
 const ids=new Set<string>();const invitees=new Set<string>();
 for(const item of input){
  if(!item||typeof item!=="object"||Array.isArray(item))return "invalid";
  const i=item as Record<string,unknown>;
  if(typeof i.invitationId!=="string"||!safeId.test(i.invitationId)||
   typeof i.referrerId!=="string"||!safeId.test(i.referrerId)||
   typeof i.inviteeId!=="string"||!safeId.test(i.inviteeId))return "invalid";
  if(i.referrerId===i.inviteeId)return "self_referral";
  if(ids.has(i.invitationId)||invitees.has(i.inviteeId))return "duplicate";
  ids.add(i.invitationId);invitees.add(i.inviteeId);
  if(i.verified!==true||i.consent!==true)return "unverified";
 }
 return "eligible_for_server_review";
}
/** La elegibilidad estructural no reemplaza identidad ni verificación de servidor. */
export function canCreditInactiveLiryBoostInvitation():false{return false;}
