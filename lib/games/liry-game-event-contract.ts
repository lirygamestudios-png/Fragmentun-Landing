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

/** Prechequeo sin efectos: no guarda eventos ni concede recompensas. */
export type LiryEventBatchCheck={ok:boolean;reason:"ok"|"invalid_batch"|"invalid_event"|"duplicate_event"|"mixed_accounts"|"mixed_games";count:number};
export function checkGameEventBatch(value:unknown):LiryEventBatchCheck{
 if(!Array.isArray(value)||value.length===0||value.length>100)
  return {ok:false,reason:"invalid_batch",count:0};
 if(!value.every(isWellFormedGameEvent))
  return {ok:false,reason:"invalid_event",count:value.length};
 if(hasDuplicateEventIds(value))
  return {ok:false,reason:"duplicate_event",count:value.length};
 if(value.some(event=>event.accountId!==value[0].accountId))
  return {ok:false,reason:"mixed_accounts",count:value.length};
 if(value.some(event=>event.publicGameCode!==value[0].publicGameCode))
  return {ok:false,reason:"mixed_games",count:value.length};
 return {ok:true,reason:"ok",count:value.length};
}
