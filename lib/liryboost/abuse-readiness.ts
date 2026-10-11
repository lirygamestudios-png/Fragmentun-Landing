/** Señales preliminares de abuso. No identifica personas ni impone sanciones. */
export type LiryBoostAbuseSignal="invalid_batch"|"too_many_invites"|"duplicate_invitees"|"self_referral"|"manual_review";
export type LiryBoostCandidate={referrerId:string;inviteeId:string;invitationId:string};
export function inspectInactiveLiryBoostAbuse(input:unknown):readonly LiryBoostAbuseSignal[]{
 if(!Array.isArray(input)||input.length===0||input.length>100)return ["invalid_batch"];
 const signals=new Set<LiryBoostAbuseSignal>();
 const invitationIds=new Set<string>();const inviteeIds=new Set<string>();
 for(const row of input){
  if(!row||typeof row!=="object"||Array.isArray(row))return ["invalid_batch"];
  const x=row as Record<string,unknown>;
  if(![x.referrerId,x.inviteeId,x.invitationId].every(v=>typeof v==="string"&&/^[a-zA-Z0-9_-]{8,80}$/.test(v)))return ["invalid_batch"];
  if(x.referrerId===x.inviteeId)signals.add("self_referral");
  if(invitationIds.has(x.invitationId as string)||inviteeIds.has(x.inviteeId as string))signals.add("duplicate_invitees");
  invitationIds.add(x.invitationId as string);inviteeIds.add(x.inviteeId as string);
 }
 if(input.length>25)signals.add("too_many_invites");
 if(signals.size)signals.add("manual_review");
 return [...signals];
}
/** Las señales no bastan para deducir fraude ni aplicar bloqueos reales. */
export function canSanctionInactiveLiryBoostParticipant():false{return false;}
