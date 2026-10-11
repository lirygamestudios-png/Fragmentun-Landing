/** Máquina de estados futura; no interactúa con pagos ni entrega artículos. */
export type SettlementState="created"|"payment_pending"|"paid_verified"|"delivery_pending"|"delivered"|"failed";
export type SettlementEvent="start_payment"|"confirm_server_payment"|"start_delivery"|"confirm_server_delivery"|"mark_failed";
export type SettlementContext={paymentProviderVerified:boolean;gameServerVerified:boolean};
export function nextInactiveSettlementState(state:SettlementState,event:SettlementEvent,context:SettlementContext):SettlementState|null{
 if(event==="mark_failed"&&state!=="delivered")return "failed";
 if(state==="created"&&event==="start_payment")return "payment_pending";
 if(state==="payment_pending"&&event==="confirm_server_payment"&&context.paymentProviderVerified)return "paid_verified";
 if(state==="paid_verified"&&event==="start_delivery"&&context.gameServerVerified)return "delivery_pending";
 if(state==="delivery_pending"&&event==="confirm_server_delivery"&&context.gameServerVerified)return "delivered";
 return null;
}
/** Simular transiciones NO significa ejecutar cobros, conceder ítems o confirmar webhooks. */
export function canExecuteInactiveSettlement():false{return false;}
