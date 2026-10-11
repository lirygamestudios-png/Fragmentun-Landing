import test from "node:test";
import assert from "node:assert/strict";
import {isWellFormedCommerceProduct,inspectInactiveCommerceCatalog} from "../lib/games/liry-commerce-catalog-integrity.ts";
const product={publicCode:"LIRY_ITEM_01",channel:"in_game_items",priceMinor:299,currency:"USD",serverCatalogVerified:true};
test("precios solo aceptan enteros no negativos en unidades menores",()=>{
 assert.equal(isWellFormedCommerceProduct(product),true);
 for(const priceMinor of [-1,2.5,Infinity,NaN])assert.equal(isWellFormedCommerceProduct({...product,priceMinor}),false);
});
test("producto sin validación del catálogo servidor nunca es válido",()=>{
 assert.equal(isWellFormedCommerceProduct({...product,serverCatalogVerified:false}),false);
});
test("códigos duplicados y divisas desconocidas no se aceptan",()=>{
 assert.equal(inspectInactiveCommerceCatalog([product,product]),"duplicate");
 assert.equal(inspectInactiveCommerceCatalog([{...product,currency:"FAKE"}]),"invalid");
});
test("catálogo de aspecto válido sigue sin poder venderse",()=>{
 assert.equal(inspectInactiveCommerceCatalog([product]),"inactive");
});
