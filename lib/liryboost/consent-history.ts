/** LiryBoost: estado de consentimiento derivado de eventos ya autenticados.
 * Lógica pura, SIN persistencia ni autorización de inscripción.
 * El servidor debe garantizar orden transaccional, propiedad y autenticidad.
 */
export type ConsentEvent={kind:"accepted"|"withdrawn";rulesVersion:string;sequence:number};
export function deriveLiryBoostConsentState(events:ReadonlyArray<ConsentEvent>,requiredRulesVersion:string):
 {active:boolean;reason:"active"|"none"|"withdrawn"|"outdated"|"invalid_history"}{
 if(!Array.isArray(events)||typeof requiredRulesVersion!=="string"||!requiredRulesVersion.trim())
  return {active:false,reason:"invalid_history"};
 let previous=0;
 let acceptedVersion:string|null=null;
 for(const event of events){
  if(!event||!Number.isSafeInteger(event.sequence)||event.sequence<=previous||
    (event.kind!=="accepted"&&event.kind!=="withdrawn")||
    typeof event.rulesVersion!=="string"||!event.rulesVersion.trim())
   return {active:false,reason:"invalid_history"};
  previous=event.sequence;
  if(event.kind==="accepted")acceptedVersion=event.rulesVersion;
  else acceptedVersion=null;
 }
 if(events.length===0)return {active:false,reason:"none"};
 if(acceptedVersion===null)return {active:false,reason:"withdrawn"};
 if(acceptedVersion!==requiredRulesVersion)return {active:false,reason:"outdated"};
 return {active:true,reason:"active"};
}
