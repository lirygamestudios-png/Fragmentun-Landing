/** LiryBoost: correlación de pruebas de elegibilidad y adjudicación.
 * El ID de transacción NO autentica por sí mismo una operación: ambas evidencias
 * deben venir de un adaptador PostgreSQL de confianza, con commit confirmado.
 * Lógica pura; no escribe datos ni abre el programa.
 */
export type AtomicAttributionProof={transactionId:unknown;committed:unknown;source:unknown};
export function verifySharedAttributionTransaction(
 eligibilityProof:AtomicAttributionProof,
 claimProof:AtomicAttributionProof
):{valid:boolean;reason:"shared_committed_transaction"|"unverified"}{
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 const a=eligibilityProof?.transactionId,b=claimProof?.transactionId;
 if(typeof a!=="string"||typeof b!=="string"||!uuid.test(a)||!uuid.test(b)||
    a.toLowerCase()!==b.toLowerCase()||
    eligibilityProof.source!=="central_database"||claimProof.source!=="central_database"||
    eligibilityProof.committed!==true||claimProof.committed!==true)
  return {valid:false,reason:"unverified"};
 return {valid:true,reason:"shared_committed_transaction"};
}
