import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../components/MiLiryAreas.tsx",import.meta.url),"utf8");
test("Mi Liry requests focus after dialog has opened",()=>assert.match(src,/requestAnimationFrame\(\(\)=>\{if\(modal\.open\)closeButton\.current\?\.focus/));
test("closed dialogs cannot steal keyboard focus",()=>assert.match(src,/if\(modal\.open\)closeButton/));
test("opening duplicate dialogs remains guarded",()=>assert.match(src,/if\(modal\.open\)return/));
