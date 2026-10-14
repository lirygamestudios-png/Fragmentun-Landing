import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../components/MiLiryAreas.tsx",import.meta.url),"utf8");
test("Mi Liry blocks duplicate showModal calls",()=>assert.match(src,/if\(modal\.open\)return;\s*modal\.showModal\(\)/));
test("Mi Liry focuses close control after opening",()=>assert.match(src,/closeButton\.current\?\.focus\(\{preventScroll:true\}\)/));
test("Mi Liry returns focus to the opening control",()=>assert.match(src,/trigger\.current\?\.focus\(\{preventScroll:true\}\)/));
test("Mi Liry resets visitor preview on close",()=>assert.match(src,/setPreviewSession\(value=>value\+1\)/));
