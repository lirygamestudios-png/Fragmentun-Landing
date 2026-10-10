import test from "node:test";import assert from "node:assert/strict";import {evaluateLiryBoostConsent} from "../lib/liryboost/enrollment-consent-gates.ts";
const t="2026-10-09T00:00:00Z";const base={userId:"u1",rulesVersion:"v1",privacyVersion:"v1",rulesAcceptedAt:t,privacyAcceptedAt:t,publicRankingOptIn:true,rankingConsentAt:t,rankingConsentRevokedAt:null};const expected={rulesVersion:"v1",privacyVersion:"v1"};const now=Date.parse("2026-10-10T00:00:00Z");
test("aceptación vigente permite registro y publicación consentida",()=>assert.deepEqual(evaluateLiryBoostConsent(base,expected,now),{registrationAllowed:true,rankingAllowed:true}));
test("sin aceptación de privacidad no permite registro",()=>assert.equal(evaluateLiryBoostConsent({...base,privacyAcceptedAt:null},expected,now).registrationAllowed,false));
test("versiones de reglas distintas obligan nueva aceptación",()=>assert.equal(evaluateLiryBoostConsent(base,{...expected,rulesVersion:"v2"},now).registrationAllowed,false));
test("sin consentimiento público permite registro, no ranking",()=>assert.deepEqual(evaluateLiryBoostConsent({...base,publicRankingOptIn:false},expected,now),{registrationAllowed:true,rankingAllowed:false}));
test("revocación del consentimiento retira ranking",()=>assert.equal(evaluateLiryBoostConsent({...base,rankingConsentRevokedAt:t},expected,now).rankingAllowed,false));
test("aceptación con fecha futura no es válida",()=>assert.equal(evaluateLiryBoostConsent({...base,rulesAcceptedAt:"2027-01-01T00:00:00Z"},expected,now).registrationAllowed,false));
