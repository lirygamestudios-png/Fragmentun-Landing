import test from "node:test";
import assert from "node:assert/strict";
import {LIRY_COMMUNITY_SERVICES,isCommunityCategory,canShowCommunityActivity} from "../lib/games/liry-community-readiness.ts";
test("las cuatro categorías comunitarias siguen inactivas",()=>{
 assert.deepEqual(Object.keys(LIRY_COMMUNITY_SERVICES).sort(),["achievements","events","friends","posts"].sort());
 assert.ok(Object.values(LIRY_COMMUNITY_SERVICES).every(status=>status==="not_configured"));
});
test("la comunidad nunca expone datos sin servicio configurado y fuente verificada",()=>{
 for(const category of Object.keys(LIRY_COMMUNITY_SERVICES)){
  assert.equal(isCommunityCategory(category),true);
  assert.equal(canShowCommunityActivity(category,true,true),false);
  assert.equal(canShowCommunityActivity(category,false,false),false);
 }
 assert.equal(isCommunityCategory("private_game_title"),false);
});
