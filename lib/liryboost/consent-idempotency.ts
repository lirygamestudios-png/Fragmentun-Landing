/**
 * Prevalidación de idempotencia de eventos de consentimiento LiryBoost.
 * No crea eventos ni implementa exclusión transaccional.
 * La base de datos debe imponer UNIQUE(actorId, operationKey) en la operación atómica.
 */
export type ConsentOperation={actorId:unknown;operationKey:unknown;kind:unknown;rulesVersion:unknown};
export function reviewConsentOperation(operation:ConsentOperation):
 {valid:false;reason:"invalid_actor"|"invalid_key"|"invalid_kind"|"invalid_rules"}|
 {valid:true;fingerprint:string}{
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 const actor=typeof operation?.actorId==="string"?operation.actorId.toLowerCase():"";
 if(!uuid.test(actor))return {valid:false,reason:"invalid_actor"};
 const key=operation.operationKey;
 if(typeof key!=="string"||!uuid.test(key))return {valid:false,reason:"invalid_key"};
 if(operation.kind!=="accepted"&&operation.kind!=="withdrawn")
  return {valid:false,reason:"invalid_kind"};
 if(typeof operation.rulesVersion!=="string"||!/^[-a-zA-Z0-9._]{1,48}$/.test(operation.rulesVersion))
  return {valid:false,reason:"invalid_rules"};
 return {valid:true,fingerprint:actor+":"+key.toLowerCase()};
}

/** Compara un reintento con la operación original recuperada del servidor.
 * No sustituye UNIQUE ni el bloqueo transaccional de la base de datos.
 */
export function compareConsentRetry(original:ConsentOperation,retry:ConsentOperation):
 "same_operation"|"conflict"|"invalid"{
 const a=reviewConsentOperation(original);
 const b=reviewConsentOperation(retry);
 if(!a.valid||!b.valid)return "invalid";
 if(a.fingerprint!==b.fingerprint)return "conflict";
 if(original.kind!==retry.kind||original.rulesVersion!==retry.rulesVersion)return "conflict";
 return "same_operation";
}
