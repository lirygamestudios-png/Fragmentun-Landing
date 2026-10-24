import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const header=readFileSync(new URL("components/LiryHeaderUtilities.tsx",root),"utf8");
const page=readFileSync(new URL("app/lirygames/page.tsx",root),"utf8");
const discovery=readFileSync(new URL("components/LiryGameDiscovery.tsx",root),"utf8");
test("header search only links to public sections with existing anchors",()=>{
 const targets=[...header.matchAll(/href:"(#[a-z-]+)"/g)].map(match=>match[1]);
 assert.deepEqual(targets,["#mundos","#liry-dna","#perfil-gamer","#comunidad","#liryboost","#tienda"]);
 for(const target of targets){
  const id=target.slice(1);
  assert.ok(page.includes(`id="${id}"`)||discovery.includes(`id="${id}"`),`Missing public search anchor: ${target}`);
 }
});
test("DNA anchor remains inside discovery component mounted by FrontDesk",()=>{
 assert.match(page,/<LiryGameDiscovery\b/);
 assert.match(discovery,/id="liry-dna"/);
});
