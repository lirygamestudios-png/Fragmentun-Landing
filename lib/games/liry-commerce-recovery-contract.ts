/** Recuperación teórica de pagos y entregas; nunca llama a proveedores ni concede ítems. */
export type CommerceRecoveryFailure="payment_timeout"|"unknown_payment_commit"|"delivery_timeout"|"unknown_delivery_commit"|"invalid_receipt"|"unauthorized_provider";
export type CommerceRecoveryDecision="retry_lookup"|"reconcile_payment"|"reconcile_delivery"|"reject"|"manual_review";
const known=new Set<CommerceRecoveryFailure>(["payment_timeout","unknown_payment_commit","delivery_timeout","unknown_delivery_commit","invalid_receipt","unauthorized_provider"]);
export function inspectInactiveCommerceRecovery(failure:CommerceRecoveryFailure,attempts:number):CommerceRecoveryDecision{
 if(!known.has(failure)||!Number.isSafeInteger(attempts)||attempts<0)return "manual_review";
 if(failure==="invalid_receipt"||failure==="unauthorized_provider")return "reject";
 if(failure==="unknown_payment_commit")return "reconcile_payment";
 if(failure==="unknown_delivery_commit")return "reconcile_delivery";
 if(attempts>=3)return "manual_review";
 return "retry_lookup";
}
/** Ante incertidumbre del pago, no se vuelve a cobrar: se consulta al proveedor. */
export function canAutomaticallyRepayOrRedeliverInactiveOrder():false{return false;}
