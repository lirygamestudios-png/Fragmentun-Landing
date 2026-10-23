import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../components/LiryDeveloperAreas.tsx",import.meta.url),"utf8");
test("developer dialog resets scroll position on opening",()=>{
 assert.match(src,/modal\.current\?\.showModal\(\)/);
 assert.match(src,/if\(modal\.current\)modal\.current\.scrollTop=0/);
});
test("developer dialog restores opener focus and clears session on close",()=>{
 assert.match(src,/onClose=\{\(\)=>\{setDialogOpen\(false\);setSession\(value=>value\+1\);if\(opener\.current\?\.isConnected\)opener\.current\.focus/);
});
test("developer dialog has an accessible title and focus target",()=>{
 assert.match(src,/aria-labelledby="liry-developer-area-heading"/);
 assert.match(src,/id="liry-developer-area-heading"/);
 assert.match(src,/close\.current\?\.focus\(\{preventScroll:true\}\)/);
});
