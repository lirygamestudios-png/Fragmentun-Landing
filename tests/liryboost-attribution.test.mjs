import test from "node:test";
import assert from "node:assert/strict";
import {precheckLiryBoostAttribution} from "../lib/liryboost/attribution-precheck.ts";
const inviter="123e4567-e89b-42d3-a456-426614174000";
const invitee="123e4567-e89b-42d3-a456-426614174001";
const valid={inviterId:inviter,inviteeId:invitee,verifiedInvitee:true,participationConsented:true,inviterEligible:true};
test("solo indica prevalidación, nunca acredita puntos",()=>{
 assert.deepEqual(precheckLiryBoostAttribution(valid,new Set()),{eligible:true,reason:"precheck_only"});
});
test("rechaza identidad inválida y autorreferencia",()=>{
 assert.equal(precheckLiryBoostAttribution({...valid,inviteeId:"?"},new Set()).reason,"invalid_identity");
 assert.equal(precheckLiryBoostAttribution({...valid,inviteeId:inviter.toUpperCase()},new Set()).reason,"self_referral");
});
test("rechaza verificación, consentimiento y elegibilidad ausentes",()=>{
 assert.equal(precheckLiryBoostAttribution({...valid,verifiedInvitee:false},new Set()).reason,"not_verified");
 assert.equal(precheckLiryBoostAttribution({...valid,participationConsented:false},new Set()).reason,"missing_consent");
 assert.equal(precheckLiryBoostAttribution({...valid,inviterEligible:false},new Set()).reason,"inviter_not_eligible");
});
test("rechaza invitado previamente atribuido",()=>{
 assert.equal(precheckLiryBoostAttribution(valid,new Set([invitee])).reason,"duplicate_invitee");
});

test("detecta duplicados aunque el UUID almacenado use mayúsculas",()=>{
 assert.equal(precheckLiryBoostAttribution(valid,new Set([invitee.toUpperCase()])).reason,"duplicate_invitee");
});
test("rechaza IDs no textuales sin lanzar excepción",()=>{
 assert.equal(precheckLiryBoostAttribution({...valid,inviteeId:null},new Set()).reason,"invalid_identity");
});
