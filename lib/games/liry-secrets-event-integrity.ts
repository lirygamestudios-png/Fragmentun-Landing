/** La acreditación de secretos exige eventos únicos validados; no desbloquea nada. */
export type SecretCompletionEvent={eventId:string;accountId:string;secretCode:string;verifiedByGameServer:boolean};
const ID=/^[A-Za-z0-9_-]{8,80}$/;
const SECRET=/^LIRY-SECRET-[A-Z0-9_-]{3,32}$/;
export function inspectInactiveSecretEvents(value:unknown):"invalid"|"duplicate"|"unverified"|"inactive"{
 if(!Array.isArray(value)||value.length===0||value.length>50)return "invalid";
 const eventIds=new Set<string>();
 const completions=new Set<string>();
 for(const raw of value){
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return "invalid";
  const x=raw as Record<string,unknown>;
  if(typeof x.eventId!=="string"||!ID.test(x.eventId)||
    typeof x.accountId!=="string"||!ID.test(x.accountId)||
    typeof x.secretCode!=="string"||!SECRET.test(x.secretCode)||
    typeof x.verifiedByGameServer!=="boolean")return "invalid";
  const completion=x.accountId+"::"+x.secretCode;
  if(eventIds.has(x.eventId)||completions.has(completion))return "duplicate";
  eventIds.add(x.eventId);completions.add(completion);
  if(!x.verifiedByGameServer)return "unverified";
 }
 return "inactive";
}
export function canGrantInactiveSecretReward():false{return false;}
