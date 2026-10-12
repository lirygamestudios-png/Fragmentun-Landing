/** Prevalidación pura de elegibilidad y consentimiento para atribuciones LiryBoost.
 * Los indicadores solo son fiables si el adaptador futuro los obtiene del servidor,
 * dentro de la misma operación transaccional que acredita al invitado.
 * No verifica sesiones ni escribe datos.
 */
import {reviewVerifiedAttributionOutcome,type VerifiedAttributionOutcome} from "./verified-attribution-outcome.ts";

export type AttributionEligibilityEvidence={
 programActive:unknown;
 referrerEligible:unknown;
 inviteeEligible:unknown;
 referrerConsentCurrent:unknown;
 inviteeConsentCurrent:unknown;
 atomicEligibilityConfirmed:unknown;
};
export function reviewEligibleAttribution(
 referrerUserId:unknown,
 inviteeUserId:unknown,
 outcome:VerifiedAttributionOutcome,
 evidence:AttributionEligibilityEvidence
):{creditable:boolean;reason:"program_inactive"|"eligibility_unverified"|"attribution_unverified"|"confirmed"}{
 if(!evidence||evidence.programActive!==true)
  return {creditable:false,reason:"program_inactive"};
 if(evidence.referrerEligible!==true||evidence.inviteeEligible!==true||
    evidence.referrerConsentCurrent!==true||evidence.inviteeConsentCurrent!==true||
    evidence.atomicEligibilityConfirmed!==true)
  return {creditable:false,reason:"eligibility_unverified"};
 const result=reviewVerifiedAttributionOutcome(referrerUserId,inviteeUserId,outcome);
 if(!result.creditable)return {creditable:false,reason:"attribution_unverified"};
 return {creditable:true,reason:"confirmed"};
}
