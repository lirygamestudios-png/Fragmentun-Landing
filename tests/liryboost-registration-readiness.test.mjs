import test from "node:test";
import assert from "node:assert/strict";
import {checkLiryBoostRegistrationReadiness} from "../lib/liryboost/registration-readiness.ts";
const approved={
 officialRulesPublished:true,privacyPolicyApproved:true,eligibleIdentityVerified:true,
 participationConsentVersioned:true,antiFraudEnabled:true,atomicAttributionVerified:true,
 databasePermissionsAudited:true,authorizedLaunch:true
};
test("registro cerrado cuando faltan todas las garantías",()=>{
 const result=checkLiryBoostRegistrationReadiness({});
 assert.equal(result.ready,false);
 assert.equal(result.missing.length,8);
});
test("cada control faltante bloquea habilitación",()=>{
 for(const key of Object.keys(approved)){
  const result=checkLiryBoostRegistrationReadiness({...approved,[key]:false});
  assert.equal(result.ready,false,key);
  assert.deepEqual(result.missing,[key]);
 }
});
test("valores no booleanos no cumplen requisitos",()=>{
 assert.equal(checkLiryBoostRegistrationReadiness({...approved,authorizedLaunch:"true"}).ready,false);
});
test("solo garantías de servidor completas pueden indicar preparación",()=>{
 assert.deepEqual(checkLiryBoostRegistrationReadiness(approved),{ready:true,missing:[]});
});
