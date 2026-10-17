import test from "node:test";
import assert from "node:assert/strict";
import {recommendUniversalLiryGames,universalLiryJourneyProgress,validLiryAffinityVector} from "../lib/games/liry-universal-affinity.ts";
const player=[3,2,1,0,1,2];
const item=(id,origin="third_party",ok=true)=>({publicId:id,origin,published:ok,releaseApproved:ok,affinityApproved:ok,affinity:[3,2,1,0,1,2]});
test("supports all 100 approved games: nine owned plus 91 third-party",()=>{
 const games=[...Array.from({length:9},(_,i)=>item("owned-"+i,"first_party")),...Array.from({length:91},(_,i)=>item("external-"+i))];
 assert.equal(recommendUniversalLiryGames(games,player,100).length,100);
 assert.deepEqual(universalLiryJourneyProgress(games,[{publicId:"external-90",origin:"third_party",verified:true}]),{eligible:100,visited:1});
});
test("unapproved games never receive DNA suggestions",()=>{
 assert.deepEqual(recommendUniversalLiryGames([item("unapproved","third_party",false)],player),[]);
});
test("invalid vectors, repeated game IDs and extra games are excluded",()=>{
 assert.equal(validLiryAffinityVector([1,2]),false);
 const games=[...Array.from({length:110},(_,i)=>item("external-"+i)),item("external-0")];
 assert.equal(recommendUniversalLiryGames(games,player,120).length,91);
});
test("global journey only counts unique verified activity for published games",()=>{
 const games=[item("a"),item("b","first_party",false)];
 assert.deepEqual(universalLiryJourneyProgress(games,[{publicId:"a",origin:"third_party",verified:true},{publicId:"a",origin:"third_party",verified:true},{publicId:"b",origin:"first_party",verified:true}]),{eligible:1,visited:1});
});

test("an unapproved duplicate cannot suppress the approved DNA profile",()=>{
 const denied={...item("same"),published:false};
 const allowed=item("same");
 assert.equal(recommendUniversalLiryGames([denied,allowed],player).length,1);
});

test("global Journey verifies game origin and respects the 100-game capacity",()=>{
 const own=Array.from({length:12},(_,i)=>item("owned-extra-"+i,"first_party"));
 const external=Array.from({length:100},(_,i)=>item("external-extra-"+i));
 const catalog=[...own,...external];
 const activity=[{publicId:"external-extra-0",origin:"first_party",verified:true},{publicId:"external-extra-1",origin:"third_party",verified:true},{publicId:"owned-extra-0",origin:"first_party",verified:true},{publicId:"external-extra-99",origin:"third_party",verified:true}];
 assert.deepEqual(universalLiryJourneyProgress(catalog,activity),{eligible:100,visited:2});
});
