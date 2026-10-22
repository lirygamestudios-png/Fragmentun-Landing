import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../components/MiLiryAreas.tsx",import.meta.url),"utf8");
test("Mi Liry blocks duplicate showModal calls",()=>assert.match(src,/if\(modal\.open\)return;\s*modal\.showModal\(\)/));
test("Mi Liry focuses close control after opening",()=>assert.match(src,/closeButton\.current\?\.focus\(\{preventScroll:true\}\)/));
test("Mi Liry returns focus to the opening control",()=>assert.match(src,/trigger\.current\?\.focus\(\{preventScroll:true\}\)/));
test("Mi Liry resets visitor preview on close",()=>assert.match(src,/setPreviewSession\(value=>value\+1\)/));

test("identity secondary material is available in accessible disclosures",()=>{const src=readFileSync(new URL("../components/MiLiryAreas.tsx",import.meta.url),"utf8");assert.match(src,/View identity summary/);assert.match(src,/developerWizardDisclosure/);assert.match(src,/<\/section><\/details>/);});

test("identity task appears before secondary disclosures",()=>{const src=readFileSync(new URL("../components/MiLiryAreas.tsx",import.meta.url),"utf8");assert.ok(src.indexOf('<MiLiryIdentityPreview key={previewSession}')<src.indexOf('View identity summary'));});

test("secondary gamer area facts are collapsible in all five informational submenus",()=>{const src=readFileSync(new URL("../components/MiLiryAreas.tsx",import.meta.url),"utf8");for(const id of ["mundos","logros","inventario","comunidad","liryboost"])assert.match(src,new RegExp('View details"[\\s\\S]*?facts\\.'+id+'\\.map'));});
