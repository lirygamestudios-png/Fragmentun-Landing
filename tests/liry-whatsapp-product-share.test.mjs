import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const file=p=>readFileSync(new URL(p,import.meta.url),"utf8");
test("product sharing is WhatsApp-first with branded preview",()=>{const s=file("../components/LiryShareEntry.tsx");for(const v of ["https://wa.me/?text=","/lirygames-brand-icon.svg","CIENTOS DE MUNDOS, INFINITAS FORMAS DE JUGAR","HUNDREDS OF WORLDS, INFINITE WAYS TO PLAY","aria-haspopup=\"dialog\""])assert.ok(s.includes(v),v);});
test("store shares target store and catalog defaults to worlds",()=>{assert.match(file("../components/LiryStoreCategories.tsx"),/section="store"/);assert.match(file("../components/LiryShareEntry.tsx"),/section==="store"\?"tienda":"mundos"/);});
test("social multi-platform share remains untouched",()=>{const s=file("../components/LiryShare.tsx");assert.match(s,/nativeShare/);assert.match(s,/facebook/);assert.match(s,/whatsapp/);});
