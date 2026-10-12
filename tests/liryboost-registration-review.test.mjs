import test from "node:test";
import assert from "node:assert/strict";
import {reviewLiryBoostRegistration} from "../lib/liryboost/registration-review.ts";
const user="123e4567-e89b-42d3-a456-426614174000";
const request={participantId:user,publicAlias:"Jugador",acceptedRulesVersion:"v1",expectedRulesVersion:"v1",consentConfirmed:true};
const identity={authenticatedUserId:user,participantOwnerUserId:user,authenticatedSessionVerified:true,accountEligible:true};
const gate={officialRulesPublished:true,privacyPolicyApproved:true,eligibleIdentityVerified:true,participationConsentVersioned:true,antiFraudEnabled:true,atomicAttributionVerified:true,databasePermissionsAudited:true,authorizedLaunch:true};
test("un programa cerrado no puede procesar una inscripción",()=>{
 assert.deepEqual(reviewLiryBoostRegistration(request,identity,{...gate,authorizedLaunch:false},"v1",user),{processable:false,stage:"launch_gate",reason:"program_not_authorized"});
});
test("si faltan las bases o consentimiento se bloquea la solicitud",()=>{
 assert.equal(reviewLiryBoostRegistration({...request,consentConfirmed:false},identity,gate,"v1",user).stage,"request");
 assert.equal(reviewLiryBoostRegistration({...request,acceptedRulesVersion:"v0"},identity,gate,"v1",user).stage,"request");
});
test("una identidad diferente impide el registro",()=>{
 assert.equal(reviewLiryBoostRegistration(request,{...identity,participantOwnerUserId:"123e4567-e89b-42d3-a456-426614174002"},gate,"v1",user).stage,"identity");
});
test("incluso con requisitos aprobados el resultado no es una inscripción",()=>{
 assert.deepEqual(reviewLiryBoostRegistration(request,identity,gate,"v1",user),{processable:true,stage:"precheck_only",reason:"requires_server_transaction"});
});

test("rechaza una versión de bases elegida falsamente por el navegador",()=>{
 const fake={...request,acceptedRulesVersion:"v0",expectedRulesVersion:"v0"};
 assert.deepEqual(reviewLiryBoostRegistration(fake,identity,gate,"v1",user),{processable:false,stage:"request",reason:"invalid_rules"});
});

test("rechaza un participante inventado aunque la sesión sea legítima",()=>{
 const other="123e4567-e89b-42d3-a456-426614174099";
 assert.deepEqual(reviewLiryBoostRegistration({...request,participantId:other},identity,gate,"v1",user),{processable:false,stage:"request",reason:"participant_mismatch"});
});
