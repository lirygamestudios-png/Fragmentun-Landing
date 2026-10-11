/** Rutas futuras de comercio. Ninguna función cobra ni redirige clientes. */
export type LiryCommerceRoute="supplier_redirect"|"direct_checkout";
export type CommerceRouteContext={
 catalogVerified:boolean;
 supplierAuthorized:boolean;
 checkoutProviderAuthorized:boolean;
 legalTermsPublished:boolean;
 customerConsent:boolean;
};
export type CommerceRouteDecision="blocked"|"awaiting_supplier"|"awaiting_checkout";
export function inspectInactiveCommerceRoute(route:LiryCommerceRoute,context:CommerceRouteContext):CommerceRouteDecision{
 if(!context.catalogVerified||!context.legalTermsPublished||!context.customerConsent)return "blocked";
 if(route==="supplier_redirect"&&!context.supplierAuthorized)return "awaiting_supplier";
 if(route==="direct_checkout"&&!context.checkoutProviderAuthorized)return "awaiting_checkout";
 return "blocked"; // Las dos rutas siguen desactivadas hasta pasar verificaciones reales.
}
export function canCreateInactiveCommerceOrder():false{return false;}
