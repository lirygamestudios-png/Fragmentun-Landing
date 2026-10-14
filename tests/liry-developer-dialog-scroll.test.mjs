import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../components/LiryDeveloperAreas.tsx",import.meta.url),"utf8");
test("developer dialog begins at top on each opening",()=>assert.match(src,/modal\.current\?\.showModal\(\);\s*if\(modal\.current\)modal\.current\.scrollTop=0/));
test("developer dialog returns focus after closing",()=>assert.match(src,/onClose=\{\(\)=>\{setSession\(value=>value\+1\);opener\.current\?\.focus/));
test("developer dialogue references an existing accessible title",()=>{assert.match(src,/aria-labelledby="liry-developer-area-heading"/);assert.match(src,/id="liry-developer-area-heading"/)});
