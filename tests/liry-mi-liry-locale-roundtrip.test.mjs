import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const page=readFileSync(new URL("../app/lirygames/mi-liry/page.tsx",import.meta.url),"utf8");
const profile=readFileSync(new URL("../components/LiryFrontdeskProfileAccess.tsx",import.meta.url),"utf8");
const areas=readFileSync(new URL("../components/MiLiryAreas.tsx",import.meta.url),"utf8");
test("profile link preserves selected FrontDesk locale",()=>assert.match(profile,/lirygames\/mi-liry\?lang=\$\{locale\}/));
test("Mi Liry entry and return links preserve selected locale",()=>{
 assert.match(page,/getReleasedLiryFrontdeskLocale\(\(await searchParams\)\.lang\)/);
 assert.match(page,/<main className=\{styles\.page\} lang=\{locale\}/);
 assert.match(page,/lirygames\?lang=\$\{locale\}#perfil-gamer/);
});
test("Mi Liry detail links preserve locale and section anchor",()=>{
 assert.match(areas,/href:\x60\/lirygames\?lang=\$\{locale\}\$\{links\[index\]\.slice/);
});

test("primary FrontDesk uses locale-specific DNA navigation label",()=>{const front=readFileSync(new URL("../app/lirygames/page.tsx",import.meta.url),"utf8");assert.match(front,/<a href="#liry-dna">\{copy\.navigation\.dna\}<\/a>/);});

test("mobile FrontDesk DNA menu uses released locale label",()=>{const front=readFileSync(new URL("../app/lirygames/page.tsx",import.meta.url),"utf8");assert.match(front,/href:"#liry-dna",label:copy\.navigation\.dna/);});
