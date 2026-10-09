import type {PaymentProviderId} from "./provider-contract";

/** Pure settlement policies. No actual payment processing or entitlement writes. */
export type SettlementStatus="pending"|"confirmed"|"refunded"|"partially_refunded"|"disputed";
export interface PaymentLedgerEntry {
 orderId:string;
 playerId:string;
 gameId:string;
 itemId:string;
 provider:PaymentProviderId;
 externalPaymentId:string;
 currency:"USD";
 grossCents:number;
 refundedCents:number;
 processorFeeCents:number;
 status:SettlementStatus;
 verifiedServerSide:boolean;
}
export interface SettlementCheck {
 reconciled:boolean;
 netCents:number;
 blockers:string[];
 mayDeliver:boolean;
}
export function reconcilePayment(entry:PaymentLedgerEntry,order:{
 id:string;playerId:string;gameId:string;itemId:string;currency:"USD";amountCents:number;
}):SettlementCheck {
 const blockers:string[]=[];
 if(!entry.verifiedServerSide)blockers.push("Confirmación no verificada por servidor");
 if(!entry.externalPaymentId)blockers.push("Falta referencia del procesador");
 if(entry.orderId!==order.id||entry.playerId!==order.playerId||entry.gameId!==order.gameId||entry.itemId!==order.itemId)blockers.push("La compra no coincide con la orden");
 if(entry.currency!==order.currency||entry.grossCents!==order.amountCents)blockers.push("Importe o moneda no coinciden");
 if(!Number.isSafeInteger(entry.grossCents)||entry.grossCents<=0||
    !Number.isSafeInteger(entry.refundedCents)||entry.refundedCents<0||entry.refundedCents>entry.grossCents||
    !Number.isSafeInteger(entry.processorFeeCents)||entry.processorFeeCents<0)
   blockers.push("Valores contables inválidos");
 if(entry.status!=="confirmed")blockers.push("Estado no permite nueva entrega");
 if(entry.refundedCents!==0)blockers.push("Compra con devolución");
 const netCents=entry.grossCents-entry.refundedCents-entry.processorFeeCents;
 return {reconciled:blockers.length===0,netCents,blockers,mayDeliver:blockers.length===0};
}
export function needsEntitlementReview(status:SettlementStatus):boolean{
 return status==="refunded"||status==="partially_refunded"||status==="disputed";
}
