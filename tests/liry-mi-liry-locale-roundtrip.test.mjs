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

test("desktop and mobile navigation use one localized dictionary",()=>{const front=readFileSync(new URL("../app/lirygames/page.tsx",import.meta.url),"utf8");assert.match(front,/<a href="#liryboost">\{copy\.navigation\.boost\}<\/a>/);assert.match(front,/href:"#liryboost",label:copy\.navigation\.boost/);assert.match(front,/href:"#mundos",label:copy\.navigation\.worlds/);});

test("header search uses approved DNA and LiryBoost labels in both languages",()=>{const source=readFileSync(new URL("../components/LiryHeaderUtilities.tsx",import.meta.url),"utf8");assert.match(source,/es:"Liry ADN",en:"Liry DNA"/);assert.match(source,/es:"LiryBoost",en:"LiryBoost"/);});

test("header utility dialog ignores repeated open while preserving keyboard focus origin",()=>{const source=readFileSync(new URL("../components/LiryHeaderUtilities.tsx",import.meta.url),"utf8");assert.match(source,/if\(!dialog\.current\|\|dialog\.current\.open\)return/);assert.match(source,/origin\.current=button/);assert.match(source,/origin\.current\?\.isConnected/);assert.match(source,/origin\.current=null/);});
