import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const src=readFileSync(new URL("../components/LiryCommunityContact.tsx",import.meta.url),"utf8");

test("contact form mounts only while modal is open and receives locale",()=>{
 assert.match(src,/opened&&<LiryContactForm locale=\{locale\}\s*\/>/);
 assert.match(src,/setOpened\(true\)/);
});
test("contact modal restores opening focus and unmounts form on close",()=>{
 assert.match(src,/onClose=\{\(\)=>\{setOpened\(false\);opener\.current\?\.focus/);
});
test("contact dialog retains approved modal accessibility semantics",()=>{
 assert.match(src,/aria-modal="true"/);
 assert.match(src,/aria-labelledby="community-contact-heading"/);
 assert.match(src,/aria-expanded=\{opened\}/);
});
