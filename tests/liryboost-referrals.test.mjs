import test from "node:test";
import assert from "node:assert/strict";
import {validateReferralCandidate,rankVerifiedReferrals} from "../lib/liryboost/referral-rules.ts";

const base={referrerId:"user-a",invitedId:"user-b",verified:true,consented:true};
test("admite un referido verificado con consentimiento",()=>{
 assert.deepEqual(validateReferralCandidate(base,new Set()),{eligible:true});
});
test("rechaza identidad vacía",()=>{
 assert.deepEqual(validateReferralCandidate({...base,invitedId:" "},new Set()),{eligible:false,reason:"missing_identity"});
});
test("rechaza autorreferencia aunque tenga espacios",()=>{
 assert.deepEqual(validateReferralCandidate({...base,invitedId:" user-a "},new Set()),{eligible:false,reason:"self_referral"});
});
test("exige consentimiento",()=>{
 assert.deepEqual(validateReferralCandidate({...base,consented:false},new Set()),{eligible:false,reason:"consent_required"});
});
test("exige verificación",()=>{
 assert.deepEqual(validateReferralCandidate({...base,verified:false},new Set()),{eligible:false,reason:"unverified"});
});
test("rechaza doble invitación",()=>{
 assert.deepEqual(validateReferralCandidate(base,new Set(["user-b"])),{eligible:false,reason:"duplicate"});
});
test("cuenta una vez por invitado y rechaza autoreferencias",()=>{
 const result=rankVerifiedReferrals([
  {referrerId:"a",invitedId:"x",verifiedAt:"2026-10-01T00:00:00Z"},
  {referrerId:"a",invitedId:"x",verifiedAt:"2026-10-02T00:00:00Z"},
  {referrerId:"b",invitedId:"y",verifiedAt:"2026-10-03T00:00:00Z"},
  {referrerId:"b",invitedId:"b",verifiedAt:"2026-10-04T00:00:00Z"}
 ]);
 assert.deepEqual(result,[{rank:1,referrerId:"a",verifiedCount:1},{rank:2,referrerId:"b",verifiedCount:1}]);
});
test("ordena por recuento, después primera verificación, y limita Top 10",()=>{
 const refs=Array.from({length:12},(_,i)=>({referrerId:"member-"+i,invitedId:"invited-"+i,verifiedAt:"2026-10-01T00:00:00Z"}));
 refs.push({referrerId:"member-11",invitedId:"extra",verifiedAt:"2026-10-02T00:00:00Z"});
 const result=rankVerifiedReferrals(refs);
 assert.equal(result.length,10);
 assert.equal(result[0].referrerId,"member-11");
 assert.equal(result[0].verifiedCount,2);
});
