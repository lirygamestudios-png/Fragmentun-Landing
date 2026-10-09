import {reconcilePayment,type PaymentLedgerEntry} from "./reconciliation";

/** Policy-only check: never grants items and does not replace a database UNIQUE constraint. */
export type VirtualDeliveryOrder={
 id:string;playerId:string;gameId:string;itemId:string;currency:"USD";amountCents:number;
};
export type ExistingDelivery={
 orderId:string;playerId:string;gameId:string;itemId:string;
 state:"pending"|"granted"|"revoked";
};
export type DeliveryDecision={
 allowed:boolean;reason:"eligible"|"payment_not_verified"|"already_granted"|"delivery_pending"|"order_mismatch";
};
export function evaluateVirtualDelivery(
 payment:PaymentLedgerEntry,order:VirtualDeliveryOrder,prior:ExistingDelivery|null
):DeliveryDecision{
 const check=reconcilePayment(payment,order);
 if(!check.mayDeliver)return {allowed:false,reason:"payment_not_verified"};
 if(prior){
  if(prior.orderId!==order.id||prior.playerId!==order.playerId||
      prior.gameId!==order.gameId||prior.itemId!==order.itemId)
    return {allowed:false,reason:"order_mismatch"};
  return {allowed:false,reason:prior.state==="granted"?"already_granted":"delivery_pending"};
 }
 return {allowed:true,reason:"eligible"};
}
