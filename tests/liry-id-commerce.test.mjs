import test from "node:test";
import assert from "node:assert/strict";
import {LIRY_COMMERCE_CHANNELS,mayOfferLiveCommerce,getInactiveCommerceSnapshot} from "../lib/games/liry-commerce-readiness.ts";
test("todos los canales comerciales siguen desactivados",()=>{
 assert.equal(Object.keys(LIRY_COMMERCE_CHANNELS).length,5);
 assert.ok(Object.values(LIRY_COMMERCE_CHANNELS).every(x=>x==="not_configured"));
});
test("freemium no puede ofrecer compras sin infraestructura autorizada",()=>{
 assert.equal(mayOfferLiveCommerce("in_game_items",{catalogVerified:true,fulfillmentDefined:true,paymentProviderApproved:true,legalTermsPublished:true,gameServerAuthorized:true}),false);
});
test("ninguna modalidad crea productos, órdenes o checkout ficticios",()=>{
 const snapshot=getInactiveCommerceSnapshot();
 assert.deepEqual(snapshot.products,[]);
 assert.deepEqual(snapshot.orders,[]);
 assert.equal(snapshot.checkoutEnabled,false);
});
