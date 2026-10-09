import type {PaymentProviderId} from "./provider-contract";

export interface SettlementBatch {
 provider:PaymentProviderId;
 settlementReference:string;
 currency:"USD";
 grossCents:number;
 feeCents:number;
 refundCents:number;
 adjustmentCents:number;
 depositCents:number;
 bankReference:string|null;
 verifiedProviderReport:boolean;
 verifiedBankDeposit:boolean;
}
export type SettlementAssessment={
 expectedDepositCents:number;
 differenceCents:number;
 reconciled:boolean;
 blockers:string[];
};
/** Read-only policy. Never treat a provider 'paid' event as verified bank settlement. */
export function assessSettlement(batch:SettlementBatch):SettlementAssessment {
 const blockers:string[]=[];
 const amounts=[batch.grossCents,batch.feeCents,batch.refundCents,batch.adjustmentCents,batch.depositCents];
 if(amounts.some(n=>!Number.isSafeInteger(n))||batch.grossCents<0||batch.feeCents<0||batch.refundCents<0||batch.depositCents<0)
   blockers.push("Importes inválidos");
 if(!batch.settlementReference)blockers.push("Falta referencia de liquidación");
 if(!batch.bankReference)blockers.push("Falta referencia bancaria");
 if(!batch.verifiedProviderReport)blockers.push("Informe del procesador no verificado");
 if(!batch.verifiedBankDeposit)blockers.push("Depósito bancario no verificado");
 const expectedDepositCents=batch.grossCents-batch.feeCents-batch.refundCents+batch.adjustmentCents;
 const differenceCents=batch.depositCents-expectedDepositCents;
 if(!Number.isSafeInteger(expectedDepositCents)||expectedDepositCents<0)blockers.push("Liquidación neta inconsistente");
 if(differenceCents!==0)blockers.push("Diferencia entre liquidación y depósito");
 return {expectedDepositCents,differenceCents,reconciled:blockers.length===0,blockers};
}
