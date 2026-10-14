import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../components/LiryDeveloperAreas.tsx",import.meta.url),"utf8");
const page=readFileSync(new URL("../app/lirygames/developer/page.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");
test("four developer sections open as modal areas",()=>{assert.match(page,/<LiryDeveloperAreas \/>/);assert.match(src,/<dialog /);assert.match(src,/showModal\(\)/)});
test("opening modal blocks duplicate calls and restores focus",()=>{assert.match(src,/if\(modal\.current\?\.open\)return/);assert.match(src,/opener\.current\?\.focus/);assert.match(src,/close\.current\?\.focus/)});
test("preview state resets after closing",()=>assert.match(src,/setSession\(value=>value\+1\)/));
test("approved modal treatment and responsive sizing",()=>{assert.match(css,/\.developerDialog::backdrop/);assert.match(css,/@media\(max-width:560px\)\{\.developerDialog/)});
