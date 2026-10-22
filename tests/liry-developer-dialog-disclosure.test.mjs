import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../components/LiryDeveloperAreas.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");
test("developer modal has an accessible heading and description",()=>{
 assert.match(src,/aria-labelledby="liry-developer-area-heading"/);
 assert.match(src,/aria-describedby="liry-developer-area-description"/);
 assert.match(src,/id="liry-developer-area-description"/);
});
test("developer preview displays localized disclosure notice",()=>{
 assert.match(src,/\{copy\.notice\}/);
 assert.match(src,/\.developerDialogDescription/);
 assert.match(css,/\.developerDialogDescription\{/);
});
