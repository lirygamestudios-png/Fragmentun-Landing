import test from "node:test";
import assert from "node:assert/strict";
import {deriveLiryBoostConsentState} from "../lib/liryboost/consent-history.ts";
const accepted={kind:"accepted",rulesVersion:"v1",sequence:1};
test("sin eventos no existe consentimiento",()=>assert.deepEqual(deriveLiryBoostConsentState([],"v1"),{active:false,reason:"none"}));
test("aceptación vigente",()=>assert.deepEqual(deriveLiryBoostConsentState([accepted],"v1"),{active:true,reason:"active"}));
test("revocación invalida la aceptación anterior",()=>assert.deepEqual(deriveLiryBoostConsentState([accepted,{kind:"withdrawn",rulesVersion:"v1",sequence:2}],"v1"),{active:false,reason:"withdrawn"}));
test("nueva aceptación explícita después de revocación",()=>assert.deepEqual(deriveLiryBoostConsentState([accepted,{kind:"withdrawn",rulesVersion:"v1",sequence:2},{kind:"accepted",rulesVersion:"v2",sequence:3}],"v2"),{active:true,reason:"active"}));
test("versión de bases desactualizada no autoriza",()=>assert.equal(deriveLiryBoostConsentState([accepted],"v2").reason,"outdated"));
test("secuencias repetidas o fuera de orden se rechazan",()=>assert.equal(deriveLiryBoostConsentState([accepted,{kind:"withdrawn",rulesVersion:"v1",sequence:1}],"v1").reason,"invalid_history"));

test("revocación sin aceptación previa se rechaza",()=>{
 assert.equal(deriveLiryBoostConsentState([{kind:"withdrawn",rulesVersion:"v1",sequence:1}],"v1").reason,"invalid_history");
});
test("revocación de versión distinta a la aceptada se rechaza",()=>{
 assert.equal(deriveLiryBoostConsentState([accepted,{kind:"withdrawn",rulesVersion:"v2",sequence:2}],"v1").reason,"invalid_history");
});
test("dos aceptaciones consecutivas sin revocar se rechazan",()=>{
 assert.equal(deriveLiryBoostConsentState([accepted,{kind:"accepted",rulesVersion:"v1",sequence:2}],"v1").reason,"invalid_history");
});
