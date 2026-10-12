/** LiryBoost: decisión de seguridad estricta cuando un control central responde.
 * Preparación pura; NO consulta Supabase, NO crea inscripciones y NO acredita puntos.
 * Se prohíbe usar estado local/memoria como prueba de admisión.
 */
export type CentralSecurityCheck={
 source:unknown;
 available:unknown;
 allowed:unknown;
 confirmed:unknown;
};
export function reviewLiryBoostCentralSecurity(check:CentralSecurityCheck):
 {permitted:true;reason:"central_verified"}|
 {permitted:false;reason:"central_unavailable"|"not_confirmed"|"blocked"}{
 if(!check||check.source!=="central_database"||check.available!==true)
  return {permitted:false,reason:"central_unavailable"};
 if(check.confirmed!==true)
  return {permitted:false,reason:"not_confirmed"};
 if(check.allowed!==true)
  return {permitted:false,reason:"blocked"};
 return {permitted:true,reason:"central_verified"};
}
