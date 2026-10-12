import test from "node:test";
import assert from "node:assert/strict";
import {checkEnrollmentIdentityBinding} from "../lib/liryboost/enrollment-identity.ts";
const user="123e4567-e89b-42d3-a456-426614174000";
const good={authenticatedUserId:user,participantOwnerUserId:user,authenticatedSessionVerified:true,accountEligible:true};
test("una identidad autenticada y elegible solo establece vinculación",()=>{
 assert.deepEqual(checkEnrollmentIdentityBinding(good),{bound:true,reason:"identity_bound_only"});
});
test("sin sesión comprobada no hay vinculación",()=>{
 assert.equal(checkEnrollmentIdentityBinding({...good,authenticatedSessionVerified:false}).reason,"missing_verified_session");
});
test("rechaza la apropiación de otro participante",()=>{
 assert.equal(checkEnrollmentIdentityBinding({...good,participantOwnerUserId:"123e4567-e89b-42d3-a456-426614174001"}).reason,"identity_mismatch");
});
test("rechaza identificadores inválidos",()=>{
 assert.equal(checkEnrollmentIdentityBinding({...good,authenticatedUserId:"no-id"}).reason,"invalid_identity");
});
test("rechaza cuentas no elegibles",()=>{
 assert.equal(checkEnrollmentIdentityBinding({...good,accountEligible:false}).reason,"ineligible_account");
});
