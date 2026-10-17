import {readFileSync} from "node:fs";
import test from "node:test";import assert from "node:assert/strict";import {rankApprovedLiryDnaCatalog,LIRY_DNA_CATALOG_CAPACITY} from "../lib/games/liry-dna-catalog-bridge.ts";
const item=(i,origin="third_party",approved=true)=>({publicId:"game-"+i,origin,published:approved,releaseApproved:approved,editorialAffinityApproved:approved,affinity:[1,2,3,1,2,3]});
test("approved game catalog has 100 seats",()=>assert.equal(LIRY_DNA_CATALOG_CAPACITY,100));
test("the DNA bridge ranks approved own and third-party games without fabricated affinity",()=>{
 const games=[...Array.from({length:9},(_,i)=>item(i,"first_party")),...Array.from({length:91},(_,i)=>item(i+9))];
 assert.equal(rankApprovedLiryDnaCatalog(games,[1,2,3,1,2,3],100).length,100);
 assert.deepEqual(rankApprovedLiryDnaCatalog([item(1,"third_party",false)],[1,2,3,1,2,3]),[]);
 assert.deepEqual(rankApprovedLiryDnaCatalog([{...item(2),affinity:null}],[1,2,3,1,2,3]),[]);
});
test("invalid questionnaire results produce no game recommendations",()=>{
 assert.deepEqual(rankApprovedLiryDnaCatalog([item(1)],[5,2,3,1,2,3]),[]);
});

test("Liry DNA component accepts only opt-in approved catalog profiles",()=>{const source=readFileSync(new URL("../components/LiryGameDiscovery.tsx",import.meta.url),"utf8");assert.match(source,/approvedDnaCatalog\?/);assert.match(source,/rankApprovedLiryDnaCatalog\(/);});
