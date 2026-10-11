import test from "node:test";import assert from "node:assert/strict";import {verifyLiryContactTurnstile} from "../lib/games/liry-contact-turnstile.ts";
test("Turnstile rechaza tokens ausentes o mal formados sin llamar al proveedor",async()=>{
 const old=process.env.LIRY_TURNSTILE_SECRET_KEY;process.env.LIRY_TURNSTILE_SECRET_KEY="dummy-secret";
 try{
  assert.equal(await verifyLiryContactTurnstile(null),false);
  assert.equal(await verifyLiryContactTurnstile(""),false);
  assert.equal(await verifyLiryContactTurnstile("x".repeat(2049)),false);
 }finally{if(old===undefined)delete process.env.LIRY_TURNSTILE_SECRET_KEY;else process.env.LIRY_TURNSTILE_SECRET_KEY=old;}
});
test("Turnstile sin clave privada nunca autoriza el envío",async()=>{
 const old=process.env.LIRY_TURNSTILE_SECRET_KEY;delete process.env.LIRY_TURNSTILE_SECRET_KEY;
 try{assert.equal(await verifyLiryContactTurnstile("fake-token"),false);}
 finally{if(old!==undefined)process.env.LIRY_TURNSTILE_SECRET_KEY=old;}
});
