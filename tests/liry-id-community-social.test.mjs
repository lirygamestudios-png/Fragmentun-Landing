import test from "node:test";
import assert from "node:assert/strict";
import {EMPTY_COMMUNITY_SOCIAL_VIEW,getInactiveCommunitySocialView,canPublishCommunitySocialRecord} from "../lib/games/liry-community-social-contract.ts";
test("Amigos, Logros y Eventos no muestran datos inventados",()=>{
 const view=getInactiveCommunitySocialView();
 assert.deepEqual(view,{friends:[],achievements:[],events:[]});
 assert.deepEqual(view,EMPTY_COMMUNITY_SOCIAL_VIEW);
});
test("sin infraestructura activa no se publica actividad social aunque la solicitud declare autorización",()=>{
 for(const category of ["friends","achievements","events"]){
  assert.equal(canPublishCommunitySocialRecord(category,{identityVerified:true,sourceVerified:true,consentGranted:true}),false);
  assert.equal(canPublishCommunitySocialRecord(category,{identityVerified:false,sourceVerified:false,consentGranted:false}),false);
 }
});
