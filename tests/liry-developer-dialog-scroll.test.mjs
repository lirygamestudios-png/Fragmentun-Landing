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

test("developer dialog navigation aria label is properly translated",()=>{assert.match(src,/locale==="es"\?"Áreas del Desarrollador":"Developer areas"/);});

test("developer wizard announces current step accessibly",()=>{assert.match(src,/<small aria-live="polite" aria-atomic="true">\{currentIndex\+1\} \/ \{areas\.length\}<\/small>/);});

test("developer dialog opener identifies its controlled dialog",()=>{assert.match(src,/aria-controls="liry-developer-area-dialog"/);assert.match(src,/<dialog id="liry-developer-area-dialog"/);});

test("developer and player modal navigation preserves mobile touch targets",()=>{const css=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");assert.match(css,/\.areaClose\{min-width:44px;min-height:44px/);assert.match(css,/\.areaLink\{min-height:44px/);assert.match(css,/\.developerWizardActions button\{touch-action:manipulation;min-height:44px\}/);assert.match(css,/\.accountLanguageNav a\{min-height:44px/);});
