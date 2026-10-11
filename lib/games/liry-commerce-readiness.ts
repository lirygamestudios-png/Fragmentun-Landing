/** Preparación del comercio LIRYGAMES; nunca efectúa cargos ni inventa productos. */
export const LIRY_COMMERCE_CHANNELS=Object.freeze({
 in_game_items:"not_configured",
 physical_merchandise:"not_configured",
 digital_collectibles:"not_configured",
 external_supplier_redirect:"not_configured",
 direct_store_checkout:"not_configured"
} as const);
export type LiryCommerceChannel=keyof typeof LIRY_COMMERCE_CHANNELS;
export type CommerceReadiness={
  catalogVerified:boolean;
  fulfillmentDefined:boolean;
  paymentProviderApproved:boolean;
  legalTermsPublished:boolean;
  gameServerAuthorized:boolean;
};
export function mayOfferLiveCommerce(channel:LiryCommerceChannel,ready:CommerceReadiness):false{
 void channel;void ready;
 // No habilitar transacciones antes de auditoría, proveedores y pruebas reales.
 return false;
}
export function getInactiveCommerceSnapshot(){
 return {channels:{...LIRY_COMMERCE_CHANNELS},products:[],orders:[],checkoutEnabled:false} as const;
}
