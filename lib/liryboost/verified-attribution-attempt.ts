/** Une verificación de atribución con el estado de intento.
 * Ambos controles son preparatorios; no constituyen prueba de transacción.
 */
import {reviewVerifiedAttributionOutcome,type VerifiedAttributionOutcome} from "./verified-attribution-outcome.ts";
import {classifyAttributionAttempt} from "./attribution-attempt.ts";
export function reviewVerifiedAttributionAttempt(
 referrerId:unknown,inviteeId:unknown,outcome:VerifiedAttributionOutcome
):{counted:boolean;retryAllowed:boolean;reason:"confirmed"|"duplicate"|"rejected"|"unverified"}{
 const verified=reviewVerifiedAttributionOutcome(referrerId,inviteeId,outcome);
 if(verified.reason==="unverified")return {counted:false,retryAllowed:false,reason:"unverified"};
 const status=verified.reason==="confirmed"?"confirmed":verified.reason;
 return classifyAttributionAttempt({status,centralConfirmed:true});
}
