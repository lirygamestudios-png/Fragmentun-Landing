import test from "node:test";import assert from "node:assert/strict";import {liryGlobalJourneySummary} from "../lib/games/liry-global-journey.ts";
const own=Array.from({length:9},(_,i)=>({slug:"owned-"+i}));
const external=Array.from({length:91},(_,i)=>({slug:"external-"+i}));
test("Journey includes approved external games without fabricating visits",()=>{assert.deepEqual(liryGlobalJourneySummary(own,external,null),{catalogSize:100,visited:0,verified:false,percent:0});});
test("Journey counts distinct server-verified game visits only",()=>{assert.deepEqual(liryGlobalJourneySummary(own,external,["external-90","owned-0","external-90","unknown"]),{catalogSize:100,visited:2,verified:true,percent:2});});
test("Journey caps game slots at 9 owned plus 91 approved third-party",()=>{assert.equal(liryGlobalJourneySummary([...own,{slug:"extra-owned"}],[...external,{slug:"extra-external"}],null).catalogSize,100);});
