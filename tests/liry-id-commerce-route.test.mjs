import test from "node:test";
import assert from "node:assert/strict";
import {inspectInactiveCommerceRoute,canCreateInactiveCommerceOrder} from "../lib/games/liry-commerce-route-contract.ts";
const all={catalogVerified:true,supplierAuthorized:true,checkoutProviderAuthorized:true,legalTermsPublished:true,customerConsent:true};
test("redirigir a proveedor externo exige proveedor autorizado",()=>{
 assert.equal(inspectInactiveCommerceRoute("supplier_redirect",{...all,supplierAuthorized:false}),"awaiting_supplier");
});
test("venta directa exige pasarela de pago autorizada",()=>{
 assert.equal(inspectInactiveCommerceRoute("direct_checkout",{...all,checkoutProviderAuthorized:false}),"awaiting_checkout");
});
test("sin consentimiento o términos publicados no se ofrecen rutas",()=>{
 assert.equal(inspectInactiveCommerceRoute("supplier_redirect",{...all,customerConsent:false}),"blocked");
 assert.equal(inspectInactiveCommerceRoute("direct_checkout",{...all,legalTermsPublished:false}),"blocked");
});
test("aun con preparación completa, ninguna ruta cobra o crea pedidos",()=>{
 assert.equal(inspectInactiveCommerceRoute("supplier_redirect",all),"blocked");
 assert.equal(inspectInactiveCommerceRoute("direct_checkout",all),"blocked");
 assert.equal(canCreateInactiveCommerceOrder(),false);
});
