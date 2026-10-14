import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const page=readFileSync(new URL("../app/lirygames/developer/page.tsx",import.meta.url),"utf8");
const access=readFileSync(new URL("../components/LiryDeveloperAccess.tsx",import.meta.url),"utf8");
test("developer panel is accessible from FrontDesk dialog",()=>assert.match(access,/href="\/lirygames\/developer"/));
test("developer panel is not indexed before launch",()=>assert.match(page,/robots:\{index:false,follow:false\}/));
test("developer panel shows premium and freemium admission",()=>assert.match(page,/Premium o Freemium/));
test("developer panel has no live submission or payment logic",()=>{assert.doesNotMatch(page,/type="file"|type="password"|fetch\(|createUser\(|checkout/);assert.match(page,/SIN OPERACIONES REALES/)});
