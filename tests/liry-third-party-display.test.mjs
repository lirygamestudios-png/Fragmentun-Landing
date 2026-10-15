import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../components/LiryThirdPartyCatalog.tsx",import.meta.url),"utf8");
test("catalog remains hidden without authorized titles",()=>assert.match(src,/if\(!games\.length\)return null/));
test("premium and freemium are distinguished in the current details panel",()=>{
 assert.match(src,/PREMIUM/);
 assert.match(src,/FREEMIUM/);
 assert.match(src,/Modalidad de compra única/);
 assert.match(src,/Acceso inicial gratuito/);
});
test("commercial availability is explicitly informative",()=>{
 assert.match(src,/VENTA NO HABILITADA/);
 assert.match(src,/SIN COMPRA NI DESCARGA/);
 assert.match(src,/Precio y disponibilidad sujetos a publicación comercial/);
 assert.doesNotMatch(src,/checkout|stripe|paypal|comprar ahora/i);
});
