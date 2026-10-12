import test from "node:test";
import assert from "node:assert/strict";
import {reviewLiryBoostConsentEvidence} from "../lib/liryboost/consent-evidence.ts";
const user="123e4567-e89b-42d3-a456-426614174000";
const evidence={authenticatedUserId:user,participantOwnerUserId:user,acceptedRulesVersion:"v1",publishedRulesVersion:"v1",consentRecordedAt:"2026-10-11T12:00:00Z",consentRevokedAt:null};
test("una evidencia válida solo supera la prevalidación",()=>{
 assert.deepEqual(reviewLiryBoostConsentEvidence(evidence),{valid:true,reason:"evidence_precheck_only"});
});
test("identidad ajena no valida consentimiento",()=>{
 assert.equal(reviewLiryBoostConsentEvidence({...evidence,participantOwnerUserId:"123e4567-e89b-42d3-a456-426614174001"}).reason,"identity_mismatch");
});
test("una versión de bases diferente no valida",()=>{
 assert.equal(reviewLiryBoostConsentEvidence({...evidence,acceptedRulesVersion:"v0"}).reason,"rules_mismatch");
});
test("sin fecha registrada válida no hay consentimiento verificable",()=>{
 assert.equal(reviewLiryBoostConsentEvidence({...evidence,consentRecordedAt:""}).reason,"no_record");
});
test("consentimiento revocado no autoriza",()=>{
 assert.equal(reviewLiryBoostConsentEvidence({...evidence,consentRevokedAt:"2026-10-11T13:00:00Z"}).reason,"revoked");
});

test("rechaza consentimiento con fecha futura",()=>{
 assert.equal(reviewLiryBoostConsentEvidence({...evidence,consentRecordedAt:"2999-01-01T00:00:00Z"}).reason,"no_record");
});
test("rechaza marcas de tiempo sin zona horaria",()=>{
 assert.equal(reviewLiryBoostConsentEvidence({...evidence,consentRecordedAt:"2026-10-11T12:00:00"}).reason,"no_record");
});
