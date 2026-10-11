import test from "node:test";
import assert from "node:assert/strict";
import {parseLiryBoostReferralToken,makeLiryBoostReferralLink} from "../lib/liryboost/referral-link.ts";

const token="A".repeat(32);
const domain="lirygames.example";
test("admite tokens opacos en formato base64url",()=>{
 assert.equal(parseLiryBoostReferralToken(token),token);
 for(const invalid of ["","A".repeat(21),"A".repeat(87),"contiene espacios","x?foo=bar","../escape",null,123])
  assert.equal(parseLiryBoostReferralToken(invalid),null);
});
test("genera la ruta canónica y un parámetro de referencia",()=>{
 assert.equal(makeLiryBoostReferralLink("https://lirygames.example/",token,domain),
  "https://lirygames.example/lirygames?liry_ref="+token);
});
test("bloquea orígenes inseguros, credenciales y parámetros",()=>{
 for(const origin of ["http://lirygames.example/","https://user:pass@lirygames.example/",
  "https://lirygames.example/?foo=1","https://lirygames.example/#frag",
  "https://lirygames.example/otra","not a URL"])
  assert.equal(makeLiryBoostReferralLink(origin,token,domain),null);
});
test("rechaza dominios no autorizados, temporales y locales",()=>{
 assert.equal(makeLiryBoostReferralLink("https://impostor.example/",token,domain),null);
 assert.equal(makeLiryBoostReferralLink("https://preview.vercel.app/",token,"preview.vercel.app"),null);
 assert.equal(makeLiryBoostReferralLink("https://localhost/",token,"localhost"),null);
 assert.equal(makeLiryBoostReferralLink("https://lirygames.example/",token,null),null);
});
test("sin código emitido por servidor no construye enlace",()=>{
 assert.equal(makeLiryBoostReferralLink("https://lirygames.example/",undefined,domain),null);
});
