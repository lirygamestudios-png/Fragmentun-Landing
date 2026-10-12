/** Integración preparatoria de atribuciones LiryBoost.
 * Las evidencias deben proceder de una misma transacción autenticada de servidor.
 * NO ejecuta SQL, NO acredita puntos ni activa el programa.
 */
import {reviewEligibleAttribution,type AttributionEligibilityEvidence} from "./attribution-eligibility.ts";
import {reviewInviteeClaim,type InviteeClaimResult} from "./invitee-claim.ts";
import type {VerifiedAttributionOutcome} from "./verified-attribution-outcome.ts";
export function reviewAtomicAttributionDecision(
 referrerId:unknown,inviteeId:unknown,
 attribution:VerifiedAttributionOutcome,
 eligibility:AttributionEligibilityEvidence,
 claim:InviteeClaimResult
):{creditable:boolean;reason:"eligible_winner"|"not_eligible"|"not_winner"}{
 const access=reviewEligibleAttribution(referrerId,inviteeId,attribution,eligibility);
 if(!access.creditable)return {creditable:false,reason:"not_eligible"};
 const winner=reviewInviteeClaim(inviteeId,referrerId,claim);
 if(!winner.credited)return {creditable:false,reason:"not_winner"};
 return {creditable:true,reason:"eligible_winner"};
}
