/**
 * Prevalidación de un lote de invitaciones del Commander Center.
 * Contrato puro: NO autentica, NO consulta DB, NO reemplaza índices UNIQUE/RLS.
 * Rechaza invitaciones compartidas por varios referidores (fail closed).
 */
import type {LiryBoostReferralEvent} from "./commander-contract.ts";
export function selectUnambiguousVerifiedInvites(events:ReadonlyArray<LiryBoostReferralEvent>):Map<string,number>{
 const byInvitee=new Map<string,LiryBoostReferralEvent[]>();
 const ids=new Map<string,LiryBoostReferralEvent>();
 const compromisedIds=new Set<string>();
 for(const event of events){
  if(!event.eventId?.trim())continue;
  const prior=ids.get(event.eventId);
  if(prior){
   if(JSON.stringify(prior)!==JSON.stringify(event))compromisedIds.add(event.eventId);
   continue;
  }
  ids.set(event.eventId,event);
  if(!event.referrerUserId?.trim()||!event.invitedUserId?.trim()||event.referrerUserId===event.invitedUserId||!Number.isFinite(Date.parse(event.occurredAt)))continue;
  const list=byInvitee.get(event.invitedUserId)??[];
  list.push(event);byInvitee.set(event.invitedUserId,list);
 }
 const totals=new Map<string,number>();
 for(const group of byInvitee.values()){
  if(group.some(x=>compromisedIds.has(x.eventId)))continue;
  if(new Set(group.map(x=>x.referrerUserId)).size!==1)continue;
  const latest=[...group].sort((a,b)=>Date.parse(b.occurredAt)-Date.parse(a.occurredAt)||b.eventId.localeCompare(a.eventId))[0];
  if(latest.status!=="verified"||!latest.verifiedAt||!Number.isFinite(Date.parse(latest.verifiedAt)))continue;
  totals.set(latest.referrerUserId,(totals.get(latest.referrerUserId)??0)+1);
 }
 return totals;
}
