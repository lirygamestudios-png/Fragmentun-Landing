import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const header=readFileSync(new URL("components/LiryHeaderUtilities.tsx",root),"utf8");
const page=readFileSync(new URL("app/lirygames/page.tsx",root),"utf8");
const discovery=readFileSync(new URL("components/LiryGameDiscovery.tsx",root),"utf8");
test("header search only links to public sections with existing anchors",()=>{
 const targets=[...header.matchAll(/href:"(#[a-z-]+)"/g)].map(match=>match[1]);
 assert.deepEqual(targets,["#mundos","#liry-dna","#perfil-gamer","#comunidad","#social","#liryboost","#tienda","#secretos"]);
 for(const target of targets){
  const id=target.slice(1);
  assert.ok(page.includes(`id="${id}"`)||discovery.includes(`id="${id}"`),`Missing public search anchor: ${target}`);
 }
});
test("DNA anchor remains inside discovery component mounted by FrontDesk",()=>{
 assert.match(page,/<LiryGameDiscovery\b/);
 assert.match(discovery,/id="liry-dna"/);
});

test("header search touch controls keep mobile accessibility dimensions",()=>{const css=readFileSync(new URL("app/lirygames/lirygames.module.css",root),"utf8");assert.match(css,/\.headerUtilityResults a\{[^}]*min-height:44px/);assert.match(css,/\.headerUtilityLabel input\{[^}]*font-size:16px/);assert.match(css,/@media\(max-width:560px\)\{\.headerUtilityResults\{grid-template-columns:1fr\}\}/);});

test("header search supports ArrowUp from first result back to its input",()=>{
 assert.match(header,/e\.key==="ArrowUp"/);
 assert.match(header,/e\.key==="ArrowDown"/);
 assert.match(header,/if\(index===0\)input\.current\?\.focus/);
 assert.match(header,/links\[index-1\]\?\.focus/);
 assert.match(header,/links\[index\+1\]\?\.focus/);
 assert.match(header,/input\.current\?\.focus\(\{preventScroll:true\}\)/);
});

test("header result navigation supports Home and End keys",()=>{
 assert.match(header,/e\.key==="Home"/);
 assert.match(header,/e\.key==="End"/);
 assert.match(header,/links\[0\]\?\.focus\(\{preventScroll:true\}\)/);
 assert.match(header,/links\[links\.length-1\]\?\.focus\(\{preventScroll:true\}\)/);
});
