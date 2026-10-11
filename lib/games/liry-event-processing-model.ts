/** Modelo puro para auditar reintentos y revocaciones. NO procesa ni acredita partidas reales. */
export type LiryEventDecision="new"|"duplicate"|"revoked"|"unauthorized"|"invalid";
export type LiryEventRequest={issuerId:string;eventId:string;issuerAuthorized:boolean;issuerRevoked:boolean;wellFormed:boolean};
export function decideInactiveEventRequest(request:LiryEventRequest,knownKeys:ReadonlySet<string>):LiryEventDecision{
 if(!request.wellFormed||!request.issuerId||!request.eventId)return "invalid";
 if(!request.issuerAuthorized)return "unauthorized";
 if(request.issuerRevoked)return "revoked";
 const key=JSON.stringify([request.issuerId,request.eventId]);
 return knownKeys.has(key)?"duplicate":"new";
}
/** Solo simula el efecto de una restricción UNIQUE atómica; nunca concede XP. */
export function simulateSerialIdempotency(requests:readonly LiryEventRequest[]):readonly LiryEventDecision[]{
 const keys=new Set<string>();
 return requests.map(request=>{
  const decision=decideInactiveEventRequest(request,keys);
  if(decision==="new")keys.add(JSON.stringify([request.issuerId,request.eventId]));
  return decision;
 });
}
/** Una simulación secuencial no prueba concurrencia de base de datos ni garantías ACID. */
