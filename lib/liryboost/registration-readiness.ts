/**
 * Puerta de preparación del registro LiryBoost.
 * Este módulo no habilita rutas, no consulta Supabase ni acepta inscripciones.
 * Cada condición debe provenir de comprobaciones confiables en servidor;
 * jamás de parámetros del navegador o de una bandera del cliente.
 */
export type LiryBoostRegistrationReadiness={
 officialRulesPublished:boolean;
 privacyPolicyApproved:boolean;
 eligibleIdentityVerified:boolean;
 participationConsentVersioned:boolean;
 antiFraudEnabled:boolean;
 atomicAttributionVerified:boolean;
 databasePermissionsAudited:boolean;
 authorizedLaunch:boolean;
};
export type LiryBoostReadinessCheck={
 ready:boolean;
 missing:ReadonlyArray<keyof LiryBoostRegistrationReadiness>;
};
export function checkLiryBoostRegistrationReadiness(
 state:LiryBoostRegistrationReadiness
):LiryBoostReadinessCheck{
 const required:(keyof LiryBoostRegistrationReadiness)[]=[
  "officialRulesPublished","privacyPolicyApproved","eligibleIdentityVerified",
  "participationConsentVersioned","antiFraudEnabled","atomicAttributionVerified",
  "databasePermissionsAudited","authorizedLaunch"
 ];
 const missing=required.filter(key=>state?.[key]!==true);
 return {ready:missing.length===0,missing};
}
