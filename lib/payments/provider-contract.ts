/**
 * Arquitectura multi-pasarela LIRYGAMES. Contratos internos solamente:
 * ni tokens, ni sesiones reales, ni métodos de cobro activos.
 */
export type PaymentProviderId="stripe"|"paypal"|"verifone_2checkout"|"crypto";
export type PaymentEnvironment="sandbox"|"production";
export type PaymentOrderStatus="created"|"awaiting_payment"|"paid"|"failed"|"refunded"|"disputed";
export interface VirtualItemCheckoutRequest{
  gameId:string;
  playerId:string;
  itemId:string;
  currency:"USD";
  amountCents:number;
  idempotencyKey:string;
}
export interface VerifiedPaymentEvent{
  provider:PaymentProviderId;
  externalPaymentId:string;
  orderId:string;
  currency:"USD";
  amountCents:number;
  status:PaymentOrderStatus;
  verifiedServerSide:boolean;
}
export interface PaymentProviderDefinition{
  id:PaymentProviderId;
  displayName:string;
  priority:1|2|3|4;
  proposedGateway:string;
  documentationStatus:"pending";
  allowedForProduction:false;
}
export const paymentProviders:readonly PaymentProviderDefinition[]=[
  {id:"stripe",displayName:"Stripe",priority:1,proposedGateway:"Stripe Payments",documentationStatus:"pending",allowedForProduction:false},
  {id:"paypal",displayName:"PayPal",priority:2,proposedGateway:"PayPal Checkout",documentationStatus:"pending",allowedForProduction:false},
  {id:"verifone_2checkout",displayName:"2Checkout / Verifone",priority:3,proposedGateway:"2Checkout",documentationStatus:"pending",allowedForProduction:false},
  {id:"crypto",displayName:"Criptomonedas",priority:4,proposedGateway:"Coinbase Business (candidato)",documentationStatus:"pending",allowedForProduction:false}
] as const;

/** Bloqueo global deliberado hasta KYB, cuentas y autorización humana. */
export const REAL_PAYMENTS_ENABLED=false;
export function canStartRealCheckout(request:VirtualItemCheckoutRequest,provider:PaymentProviderId):boolean{
  if(!REAL_PAYMENTS_ENABLED)return false;
  if(!paymentProviders.some(p=>p.id===provider&&p.allowedForProduction))return false;
  return request.amountCents>0&&request.currency==="USD"&&!!request.playerId&&!!request.itemId;
}
export function mayGrantVirtualItem(event:VerifiedPaymentEvent,order:{id:string;amountCents:number;currency:string}):boolean{
  return event.verifiedServerSide===true&&event.status==="paid"&&event.orderId===order.id&&
    event.currency===order.currency&&event.amountCents===order.amountCents&&event.amountCents>0&&
    !!event.externalPaymentId;
}
