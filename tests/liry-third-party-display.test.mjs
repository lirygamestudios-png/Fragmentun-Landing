import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {LIRY_FRONTDESK_STRINGS} from "../lib/games/liry-frontdesk-i18n.ts";

const src=readFileSync(new URL("../components/LiryThirdPartyCatalog.tsx",import.meta.url),"utf8");
const es=LIRY_FRONTDESK_STRINGS.es.thirdPartyCatalog;
const en=LIRY_FRONTDESK_STRINGS.en.thirdPartyCatalog;

test("catalog remains hidden without authorized titles",()=>{
 assert.match(src,/if\(!games\.length\)return null/);
});
test("premium and freemium are distinguished in the current details panel",()=>{
 assert.match(src,/PREMIUM/);
 assert.match(src,/FREEMIUM/);
 assert.match(src,/copy\.premium/);
 assert.match(src,/copy\.freemium/);
 assert.match(es.premium,/Modalidad de compra única/);
 assert.match(es.freemium,/Acceso inicial gratuito/);
 assert.match(en.premium,/One-time purchase model/);
 assert.match(en.freemium,/Free initial access/);
});
test("commercial availability remains informative in ES and EN and cannot initiate checkout",()=>{
 assert.match(src,/copy\.listingNotice/);
 assert.match(src,/copy\.dialogAvailability/);
 assert.match(es.listingNotice,/VENTA NO HABILITADA/);
 assert.match(es.dialogAvailability,/SIN COMPRA NI DESCARGA/);
 assert.match(es.premium,/Precio y disponibilidad sujetos a publicación comercial/);
 assert.match(en.listingNotice,/SALES NOT ENABLED/);
 assert.match(en.dialogAvailability,/NO PURCHASES OR DOWNLOADS/);
 assert.match(en.notice,/Purchases and downloads are not available/);
 assert.doesNotMatch(src,/checkout|stripe|paypal|comprar ahora/i);
});
