import test from "node:test";
import assert from "node:assert/strict";
import {projectApprovedExternalSource} from "../lib/games/liry-approved-source-boundary.ts";
const hash="a".repeat(64);
const record=(i=1)=>({
 gameId:"external-"+i,published:true,releaseApproved:true,
 submission:{developerId:"verified-developer",gameId:"external-"+i,model:"freemium",state:"approved",artifactHash:hash,approvedArtifactHash:hash,ownerVerified:true,commercialRightsVerified:true,humanApproved:true},
 publicCard:{slug:"external-"+i,title:"Juego revisado "+i,description:"Ficha de prueba aislada",model:"freemium",coverUrl:null,developerId:"private"}
});
test("unknown and unauthorised sources always produce an empty catalog",()=>{
 for(const source of [null,undefined,{},[record()],{"0":record()}]){
  assert.deepEqual(projectApprovedExternalSource(source,{sourceApproved:false}),[]);
 }
 assert.deepEqual(projectApprovedExternalSource({}, {sourceApproved:true}),[]);
});
test("approved source still requires full human release and matching artifact",()=>{
 assert.equal(projectApprovedExternalSource([record()],{sourceApproved:true}).length,1);
 assert.deepEqual(projectApprovedExternalSource([{...record(),submission:{...record().submission,humanApproved:false}}],{sourceApproved:true}),[]);
 assert.deepEqual(projectApprovedExternalSource([{...record(),submission:{...record().submission,approvedArtifactHash:"b".repeat(64)}}],{sourceApproved:true}),[]);
});
test("source never emits developer identity or confidential build hashes",()=>{
 assert.deepEqual(projectApprovedExternalSource([record()],{sourceApproved:true}),[{slug:"external-1",title:"Juego revisado 1",description:"Ficha de prueba aislada",model:"freemium",coverUrl:null}]);
});
test("unsafe and malformed source records do not crash or publish",()=>{
 assert.deepEqual(projectApprovedExternalSource([null,{},1,"x",{...record(),publicCard:null}],{sourceApproved:true}),[]);
});
test("source enforces 91 available external slots and duplicate protection",()=>{
 const cards=projectApprovedExternalSource(Array.from({length:108},(_,i)=>record(i+1)),{sourceApproved:true});
 assert.equal(cards.length,91);
 assert.equal(new Set(cards.map(x=>x.slug)).size,91);
});
