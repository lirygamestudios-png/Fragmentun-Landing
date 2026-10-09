import type {SettlementStatus} from "./reconciliation";

/** Pure policy evaluation; no calls to billing providers, writes or inventory changes. */
export type EntitlementState="pending"|"granted"|"suspended"|"revoked";
export type Resolution="keep"|"review"|"consider_suspend"|"consider_revoke";
export interface RefundDisputeCase{
  transactionVerified:boolean;
  eventVerified:boolean;
  currentStatus:SettlementStatus;
  entitlementState:EntitlementState;
  grossCents:number;
  refundedCents:number;
  disputeOpen:boolean;
  virtualItemConsumed:boolean;
}
export interface RefundDisputeDecision{
  resolution:Resolution;
  requiresHumanReview:boolean;
  reason:string;
}
export function assessRefundOrDispute(input:RefundDisputeCase):RefundDisputeDecision{
  if(!input.transactionVerified||!input.eventVerified)
    return {resolution:"review",requiresHumanReview:true,reason:"Evento o compra sin verificación confiable"};
  if(!Number.isSafeInteger(input.grossCents)||input.grossCents<=0||
     !Number.isSafeInteger(input.refundedCents)||input.refundedCents<0||input.refundedCents>input.grossCents)
    return {resolution:"review",requiresHumanReview:true,reason:"Importes inconsistentes"};
  if(input.disputeOpen||input.currentStatus==="disputed")
    return {resolution:"consider_suspend",requiresHumanReview:true,reason:"Disputa pendiente de resolución"};
  if(input.currentStatus==="refunded"&&input.refundedCents===input.grossCents)
    return {resolution:input.virtualItemConsumed?"review":"consider_revoke",requiresHumanReview:true,reason:"Reembolso total confirmado"};
  if(input.currentStatus==="partially_refunded"||input.refundedCents>0)
    return {resolution:"review",requiresHumanReview:true,reason:"Reembolso parcial requiere evaluación"};
  if(input.currentStatus==="confirmed"&&input.refundedCents===0)
    return {resolution:"keep",requiresHumanReview:false,reason:"Sin eventos adversos"};
  return {resolution:"review",requiresHumanReview:true,reason:"Estado de pago sin resolución"};
}
