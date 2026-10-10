/**
 * Contrato interno preparatorio LiryBoost → Commander Center.
 * No crea rutas HTTP, no consulta usuarios y no modifica Supabase.
 */
export type LiryBoostReferralStatus="pending"|"verified"|"rejected"|"revoked";
export type LiryBoostReferralEvent={
  eventId:string;
  referrerUserId:string;
  invitedUserId:string;
  status:LiryBoostReferralStatus;
  occurredAt:string;
  verifiedAt:string|null;
};
export type LiryBoostSummary={
  referrerUserId:string;
  verifiedInvitations:number;
  pendingInvitations:number;
  rejectedInvitations:number;
  revokedInvitations:number;
};
export function summarizeLiryBoostReferrals(
 events:ReadonlyArray<LiryBoostReferralEvent>,
 referrerUserId:string
):LiryBoostSummary{
 const summary:LiryBoostSummary={
  referrerUserId,
  verifiedInvitations:0,pendingInvitations:0,rejectedInvitations:0,revokedInvitations:0
 };
 // Una invitación solo puede aportar un estado vigente.
 // Quien consuma este contrato debe entregar eventos ya autorizados
 // y ordenados desde el almacén transaccional.
 const latest=new Map<string,LiryBoostReferralEvent>();
 for(const event of events){
  if(event.referrerUserId!==referrerUserId||!event.invitedUserId.trim()||!Number.isFinite(Date.parse(event.occurredAt)))continue;
  const previous=latest.get(event.invitedUserId);
  if(!previous||event.occurredAt>=previous.occurredAt)latest.set(event.invitedUserId,event);
 }
 for(const event of latest.values()){
  if(event.status==="verified"&&event.verifiedAt&&Number.isFinite(Date.parse(event.verifiedAt)))summary.verifiedInvitations++;
  else if(event.status==="pending")summary.pendingInvitations++;
  else if(event.status==="rejected")summary.rejectedInvitations++;
  else if(event.status==="revoked")summary.revokedInvitations++;
 }
 return summary;
}
