import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../components/LiryDeveloperAdmissionPreview.tsx",import.meta.url),"utf8");
test("developer application shows six sequential steps with completed and locked status",()=>{
 assert.match(src,/const steps=\[/);
 assert.match(src,/const completed=steps\.filter\(step=>step\.done\)\.length/);
 assert.match(src,/step\.done\?"✓"/);
 assert.match(src,/Completado/);
 assert.match(src,/Bloqueado/);
 assert.match(src,/aria-current=\{step\.enabled&&!step\.done\?"step":undefined\}/);
});
test("required declarations only unlock after business model is selected",()=>{
 assert.match(src,/enabled:model!==null/);
 assert.match(src,/fieldset disabled=\{model===null\}/);
});
test("identity guidance only unlocks after five declarations; actual biometric approval stays locked",()=>{
 assert.match(src,/ready\?<LiryDeveloperIdentityPreview locale=\{locale\}/);
 assert.match(src,/title:locale==="es"\?"Verificación de identidad":"Identity verification",done:false,enabled:ready/);
 assert.match(src,/title:locale==="es"\?"Aprobación LIRYGAMES":"LIRYGAMES approval",done:false,enabled:false/);
});

test("bank statement review remains a locked and separate payout gate",()=>{
 assert.match(src,/Validación bancaria para pagos/);
 assert.match(src,/Bank payout verification/);
 assert.match(src,/done:false,enabled:false/);
 assert.match(src,/estado de cuenta más reciente/);
 assert.match(src,/max=\{6\}/);
});
