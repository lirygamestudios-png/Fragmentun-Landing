/** Validación de forma para eventos futuros. NO autentica el emisor ni adjudica XP. */
export type LiryGameEventCandidate={
  eventId:string;
  accountId:string;
  publicGameCode:string;
  occurredAt:string;
  experiencePoints:number;
};
const CODES=new Set(["LIRY // ARENA-01","LIRY // BOT-02","LIRY // ECON-03","LIRY // EARTH-04","LIRY // LINK-05","LIRY // REALM-06","LIRY // EMOTION-07","LIRY // TITAN-08","LIRY // CODE-09"]);
const idPattern=/^[a-zA-Z0-9_-]{8,80}$/;
export function isWellFormedGameEvent(value:unknown):value is LiryGameEventCandidate{
 if(!value||typeof value!=="object"||Array.isArray(value))return false;
 const item=value as Record<string,unknown>;
 if(!idPattern.test(String(item.eventId??""))||!idPattern.test(String(item.accountId??"")))return false;
 if(typeof item.publicGameCode!=="string"||!CODES.has(item.publicGameCode))return false;
 if(typeof item.occurredAt!=="string"||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?Z$/.test(item.occurredAt))return false;
 if(!Number.isFinite(Date.parse(item.occurredAt))||Date.parse(item.occurredAt)>Date.now())return false;
 return typeof item.experiencePoints==="number"&&Number.isSafeInteger(item.experiencePoints)&&item.experiencePoints>=0;
}
/** Solo detección local en un lote; la idempotencia real debe persistir en el servidor. */
export function hasDuplicateEventIds(events:readonly LiryGameEventCandidate[]):boolean{
 return new Set(events.map(event=>event.eventId)).size!==events.length;
}
