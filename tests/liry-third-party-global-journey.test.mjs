import test from "node:test";import assert from "node:assert/strict";import {liryGlobalJourneySummary,liryVisibleJourneyCatalog} from "../lib/games/liry-global-journey.ts";
const own=Array.from({length:9},(_,i)=>({slug:"owned-"+i}));
const external=Array.from({length:91},(_,i)=>({slug:"external-"+i}));
test("Journey includes approved external games without fabricating visits",()=>{assert.deepEqual(liryGlobalJourneySummary(own,external,null),{catalogSize:100,visited:0,verified:false,percent:0});});
test("Journey counts distinct server-verified game visits only",()=>{assert.deepEqual(liryGlobalJourneySummary(own,external,["external-90","owned-0","external-90","unknown"]),{catalogSize:100,visited:2,verified:true,percent:2});});
test("Journey caps game slots at 9 owned plus 91 approved third-party",()=>{assert.equal(liryGlobalJourneySummary([...own,{slug:"extra-owned"}],[...external,{slug:"extra-external"}],null).catalogSize,100);});

test("Los registros repetidos o vacíos no consumen plazas del catálogo global",()=>{
 const ownWithDuplicates=[{slug:"owned-0"},{slug:"owned-0"},{slug:""},{slug:"owned-1"}];
 const externalWithDuplicates=[{slug:"owned-0"},{slug:"external-0"},{slug:"external-0"},{slug:"external-1"}];
 assert.deepEqual(liryGlobalJourneySummary(ownWithDuplicates,externalWithDuplicates,["owned-0","external-1"]),{catalogSize:4,visited:2,verified:true,percent:50});
});

test("La lista visible coincide con el denominador del recorrido",()=>{
 const own=[{slug:"a"},{slug:"a"},{slug:"b"}];
 const external=[{slug:"b"},{slug:"c"},{slug:"c"},{slug:"d"}];
 const visible=liryVisibleJourneyCatalog(own,external);
 assert.deepEqual(visible.map(x=>x.slug),["a","b","c","d"]);
 assert.equal(visible.length,liryGlobalJourneySummary(own,external,null).catalogSize);
});
