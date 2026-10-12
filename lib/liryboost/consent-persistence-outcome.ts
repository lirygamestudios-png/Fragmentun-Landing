/** LiryBoost: interpretación estricta de resultados de operaciones persistidas.
 * Esta función NO escribe ni simula atomicidad. Únicamente traduce un resultado
 * confirmado por una futura transacción de servidor a un estado de respuesta.
 */
export type StoredConsentOutcome={
 status:unknown;
 confirmed:unknown;
 storedOperationFingerprint:unknown;
};
export function classifyStoredConsentOutcome(
 expectedFingerprint:string,
 outcome:StoredConsentOutcome
):{acknowledged:boolean;status:"committed"|"replayed"|"conflict"|"unconfirmed"}{
 if(typeof expectedFingerprint!=="string"||!expectedFingerprint.trim()||
    !outcome||outcome.confirmed!==true)
  return {acknowledged:false,status:"unconfirmed"};
 if(outcome.status==="conflict")
  return {acknowledged:false,status:"conflict"};
 if((outcome.status==="committed"||outcome.status==="replayed")&&
    outcome.storedOperationFingerprint===expectedFingerprint)
  return {acknowledged:true,status:outcome.status};
 return {acknowledged:false,status:"unconfirmed"};
}
