/** Contrato preparatorio; nunca cobra ni crea pedidos. */
export type TransactionCheck="invalid"|"duplicate_attempt"|"mixed_order"|"inactive";
const ID=/^[A-Za-z0-9_-]{8,80}$/;
export function inspectInactiveTransactionBatch(value:unknown):TransactionCheck{
 if(!Array.isArray(value)||value.length===0||value.length>50)return "invalid";
 const seen=new Set<string>();
 let order:string|null=null;
 let account:string|null=null;
 let currency:string|null=null;
 let amount:number|null=null;
 for(const raw of value){
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return "invalid";
  const x=raw as Record<string,unknown>;
  if(typeof x.orderId!=="string"||!ID.test(x.orderId)||
    typeof x.paymentAttemptId!=="string"||!ID.test(x.paymentAttemptId)||
    typeof x.accountId!=="string"||!ID.test(x.accountId)||
    (x.currency!=="USD"&&x.currency!=="DOP")||
    typeof x.amountMinor!=="number"||!Number.isSafeInteger(x.amountMinor)||x.amountMinor<0)return "invalid";
  if(order!==null&&(x.orderId!==order||x.accountId!==account||x.currency!==currency||x.amountMinor!==amount))return "mixed_order";
  order=x.orderId;account=x.accountId;currency=x.currency;amount=x.amountMinor;
  if(seen.has(x.paymentAttemptId))return "duplicate_attempt";
  seen.add(x.paymentAttemptId);
 }
 return "inactive";
}
/** Las transacciones reales exigirán clave persistente idempotente y pasarela verificada. */
export function canSettleInactiveCommercePayment():false{return false;}
