/** Límite previo al procesamiento de mensajes públicos. */
export const LIRY_CONTACT_MAX_BODY_BYTES=12000;
export function checkLiryContactRequestHeaders(contentType:string|null,contentLength:string|null):"ok"|"invalid_type"|"too_large"|"invalid_length"{
 if(!contentType||!/^application\/json(?:\s*;|\s*$)/i.test(contentType))return "invalid_type";
 if(contentLength!==null){
  if(!/^\d+$/.test(contentLength))return "invalid_length";
  const length=Number(contentLength);
  if(!Number.isSafeInteger(length))return "invalid_length";
  if(length>LIRY_CONTACT_MAX_BODY_BYTES)return "too_large";
 }
 return "ok";
}
