/** Contratos inactivos de entrega digital y reembolso. Sin operaciones de pago. */
export type FulfillmentRefundStatus="invalid"|"requires_reconciliation"|"inactive";
export type FulfillmentRefundCandidate={
 orderId:string;paymentReference:string;gameAccountId:string;itemCode:string;
 paymentServerVerified:boolean;gameServerVerified:boolean;alreadyDelivered:boolean;
 refundRequested:boolean;refundProviderVerified:boolean;
};
const ID=/^[a-zA-Z0-9_-]{8,80}$/;
export function inspectInactiveFulfillmentRefund(value:unknown):FulfillmentRefundStatus{
 if(!value||typeof value!=="object"||Array.isArray(value))return "invalid";
 const x=value as Record<string,unknown>;
 if(![x.orderId,x.paymentReference,x.gameAccountId,x.itemCode].every(v=>typeof v==="string"&&ID.test(v))||
    typeof x.paymentServerVerified!=="boolean"||typeof x.gameServerVerified!=="boolean"||
    typeof x.alreadyDelivered!=="boolean"||typeof x.refundRequested!=="boolean"||
    typeof x.refundProviderVerified!=="boolean")return "invalid";
 if(!x.paymentServerVerified||!x.gameServerVerified||x.alreadyDelivered||
    (x.refundRequested&&!x.refundProviderVerified))return "requires_reconciliation";
 return "inactive";
}
export function canDeliverOrRefundInactivePurchase():false{return false;}
