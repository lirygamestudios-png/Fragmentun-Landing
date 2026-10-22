import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../components/MiLiryAreas.tsx",import.meta.url),"utf8");
test("Mi Liry blocks duplicate showModal calls",()=>assert.match(src,/if\(modal\.open\)return;[\s\S]*?modal\.showModal\(\)/));
test("Mi Liry focuses close control after opening",()=>assert.match(src,/closeButton\.current\?\.focus\(\{preventScroll:true\}\)/));
test("Mi Liry returns focus to the opening control",()=>assert.match(src,/trigger\.current\?\.focus\(\{preventScroll:true\}\)/));
test("Mi Liry resets visitor preview on close",()=>assert.match(src,/setPreviewSession\(value=>value\+1\)/));

test("identity secondary material is available in accessible disclosures",()=>{const src=readFileSync(new URL("../components/MiLiryAreas.tsx",import.meta.url),"utf8");assert.match(src,/View identity summary/);assert.match(src,/developerWizardDisclosure/);assert.match(src,/<\/section><\/details>/);});

test("identity task appears before secondary disclosures",()=>{const src=readFileSync(new URL("../components/MiLiryAreas.tsx",import.meta.url),"utf8");assert.ok(src.indexOf('<MiLiryIdentityPreview key={previewSession}')<src.indexOf('View identity summary'));});

test("secondary gamer area facts are collapsible in all five informational submenus",()=>{const src=readFileSync(new URL("../components/MiLiryAreas.tsx",import.meta.url),"utf8");for(const id of ["mundos","logros","inventario","comunidad","liryboost"])assert.match(src,new RegExp('View details"[\\s\\S]*?facts\\.'+id+'\\.map'));});

test("expanded gamer details respect narrow viewports and reduced-motion settings",()=>{const css=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");assert.match(css,/\.areaDialog \.developerWizardDisclosure\{min-width:0;max-width:100%;box-sizing:border-box\}/);assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);});

test("dialog opener is recorded only after checking the modal is closed",()=>{assert.match(src,/if\(modal\.open\)return;\s*setSelected\(area\);\s*trigger\.current=button;/);});

test("native modal supports Escape and both close buttons use dialog semantics",()=>{
 assert.match(src,/<dialog id="mi-liry-area-dialog"[^>]*aria-modal="true"/);
 assert.doesNotMatch(src,/onCancel=\{[^}]*preventDefault/);
 assert.match(src,/<form method="dialog"><button ref=\{closeButton\}/);
 assert.match(src,/<form method="dialog"><button type="submit" className=\{styles\.areaLink\}>\{copy\.back\}/);
});
test("all close paths restore focus and reset temporary modal state",()=>{
 assert.match(src,/onClose=\{\(\)=>\{setOpenedAreaId\(null\);setPreviewSession\(value=>value\+1\);trigger\.current\?\.focus\(\{preventScroll:true\}\);trigger\.current=null;/);
 assert.match(src,/if\(event\.target===dialog\.current\)dialog\.current\.close\(\)/);
});
