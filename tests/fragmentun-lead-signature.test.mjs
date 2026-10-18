import test from "node:test";
import assert from "node:assert/strict";
import {webcrypto} from "node:crypto";

const subtle=webcrypto.subtle;
const encoder=new TextEncoder();

async function signature(secret,timestamp,body){
 const key=await subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const signed=await subtle.sign("HMAC",key,encoder.encode(timestamp+"."+body));
 return Buffer.from(signed).toString("hex");
}
async function verify(secret,timestamp,body,provided,now){
 if(!/^\d{10}$/.test(timestamp)||!/^[a-f0-9]{64}$/.test(provided))return false;
 if(Math.abs(now-Number(timestamp))>300)return false;
 const actual=await signature(secret,timestamp,body);
 return actual===provided;
}

test("firma de Vercel coincide con verificador de Supabase",async()=>{
 const now=1792340000,body=JSON.stringify({email:"qa@example.test",consent_marketing:true});
 const signed=await signature("test-only-not-a-secret",String(now),body);
 assert.equal(await verify("test-only-not-a-secret",String(now),body,signed,now),true);
});
test("rechaza contenido modificado",async()=>{
 const now=1792340000,body='{"consent_marketing":true}';
 const signed=await signature("test-only-not-a-secret",String(now),body);
 assert.equal(await verify("test-only-not-a-secret",String(now),'{"consent_marketing":false}',signed,now),false);
});
test("rechaza firma con clave distinta",async()=>{
 const now=1792340000,body="{}";
 const signed=await signature("other-test-key",String(now),body);
 assert.equal(await verify("test-only-not-a-secret",String(now),body,signed,now),false);
});
test("rechaza solicitudes caducadas y encabezados inválidos",async()=>{
 const now=1792340000,body="{}",signed=await signature("test-only-not-a-secret",String(now-301),body);
 assert.equal(await verify("test-only-not-a-secret",String(now-301),body,signed,now),false);
 assert.equal(await verify("test-only-not-a-secret","invalid",body,signed,now),false);
});
