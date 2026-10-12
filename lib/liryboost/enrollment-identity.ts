/**
 * LiryBoost: comprobación pura de vinculación de identidad (preproducción).
 * El servidor debe resolver authenticatedUserId usando una sesión verificada;
 * NUNCA usar un ID que el cliente declare como prueba de autenticación.
 * No autoriza inscripción, no escribe registros ni activa el programa.
 */
export type EnrollmentIdentityBinding={
 authenticatedUserId:unknown;
 participantOwnerUserId:unknown;
 authenticatedSessionVerified:unknown;
 accountEligible:unknown;
};
export type IdentityBindingResult=
 {bound:false;reason:"missing_verified_session"|"invalid_identity"|"identity_mismatch"|"ineligible_account"}|
 {bound:true;reason:"identity_bound_only"};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function checkEnrollmentIdentityBinding(data:EnrollmentIdentityBinding):IdentityBindingResult{
 if(data?.authenticatedSessionVerified!==true)return {bound:false,reason:"missing_verified_session"};
 const auth=typeof data.authenticatedUserId==="string"?data.authenticatedUserId.toLowerCase():"";
 const owner=typeof data.participantOwnerUserId==="string"?data.participantOwnerUserId.toLowerCase():"";
 if(!UUID.test(auth)||!UUID.test(owner))return {bound:false,reason:"invalid_identity"};
 if(auth!==owner)return {bound:false,reason:"identity_mismatch"};
 if(data.accountEligible!==true)return {bound:false,reason:"ineligible_account"};
 return {bound:true,reason:"identity_bound_only"};
}
