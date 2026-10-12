/** LiryBoost: clasificación de intentos de atribución.
 * Es lógica pura preparatoria. No consulta ni modifica PostgreSQL.
 * El estado de almacenamiento debe originarse en una transacción verificada.
 */
export type AttributionAttemptOutcome={
 status:unknown;
 centralConfirmed:unknown;
};
export function classifyAttributionAttempt(outcome:AttributionAttemptOutcome):
 {counted:boolean;retryAllowed:boolean;reason:"confirmed"|"duplicate"|"rejected"|"unverified"}{
 if(!outcome||outcome.centralConfirmed!==true)
  return {counted:false,retryAllowed:false,reason:"unverified"};
 if(outcome.status==="confirmed")
  return {counted:true,retryAllowed:false,reason:"confirmed"};
 if(outcome.status==="duplicate")
  return {counted:false,retryAllowed:false,reason:"duplicate"};
 if(outcome.status==="rejected")
  return {counted:false,retryAllowed:true,reason:"rejected"};
 return {counted:false,retryAllowed:false,reason:"unverified"};
}
