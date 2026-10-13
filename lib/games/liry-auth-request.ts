/** Requisitos de datos de LIRY ID para el futuro flujo de autenticación.
 * No crea usuarios, no almacena contraseñas y nunca confía en el cliente para autorizar.
 */
export type LiryAuthAction="register"|"sign_in"|"recover";
export type LiryAuthRequest={action:unknown;email:unknown;returnTo:unknown};
export function reviewLiryAuthRequest(payload:LiryAuthRequest):{valid:boolean;reason:"valid"|"invalid_action"|"invalid_email"|"invalid_redirect"}{
 if(!["register","sign_in","recover"].includes(String(payload?.action??"")))
  return {valid:false,reason:"invalid_action"};
 const email=payload?.email;
 if(typeof email!=="string"||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
  return {valid:false,reason:"invalid_email"};
 const returnTo=payload?.returnTo;
 if(returnTo!==undefined&&returnTo!==null&&
  (typeof returnTo!=="string"||!["/lirygames","/lirygames/mi-liry"].includes(returnTo)))
  return {valid:false,reason:"invalid_redirect"};
 return {valid:true,reason:"valid"};
}
