import test from "node:test";import assert from "node:assert/strict";import {evaluateEnrollmentReadiness} from "../lib/liryboost/enrollment-readiness.ts";
const t="2026-10-09T00:00:00Z";const base={draft:{alias:"Jugador Uno",email:"jugador@example.com",rulesAccepted:true,privacyAccepted:true},identity:{emailVerified:true,verifiedEmail:"jugador@example.com",submittedEmail:"jugador@example.com",existingAccountUserId:null,currentUserId:"u1"},consent:{userId:"u1",rulesVersion:"v1",privacyVersion:"v1",rulesAcceptedAt:t,privacyAcceptedAt:t,publicRankingOptIn:false,rankingConsentAt:null,rankingConsentRevokedAt:null},rulesVersion:"v1",privacyVersion:"v1",now:Date.parse("2026-10-10T00:00:00Z")};
test("preparado sin consentimiento público opcional",()=>assert.equal(evaluateEnrollmentReadiness(base),"ready_for_transaction"));
test("datos incorrectos bloquean",()=>assert.equal(evaluateEnrollmentReadiness({...base,draft:{...base.draft,email:"mal"}}),"invalid_fields"));
test("correo no verificado bloquea",()=>assert.equal(evaluateEnrollmentReadiness({...base,identity:{...base.identity,emailVerified:false}}),"identity_unverified"));
test("bases desactualizadas bloquean",()=>assert.equal(evaluateEnrollmentReadiness({...base,rulesVersion:"v2"}),"consent_missing"));
test("falta aceptación expresa de privacidad",()=>assert.equal(evaluateEnrollmentReadiness({...base,draft:{...base.draft,privacyAccepted:false}}),"invalid_fields"));

test("consentimiento perteneciente a otro usuario se rechaza",()=>assert.equal(evaluateEnrollmentReadiness({...base,consent:{...base.consent,userId:"u2"}}),"consent_missing"));
test("sin identidad autenticada no se puede continuar",()=>assert.equal(evaluateEnrollmentReadiness({...base,identity:{...base.identity,currentUserId:null}}),"identity_unverified"));

test("correo del formulario distinto del autenticado se rechaza",()=>assert.equal(evaluateEnrollmentReadiness({...base,draft:{...base.draft,email:"otro@example.com"}}),"identity_unverified"));
test("correo del formulario admite diferencias de mayúsculas",()=>assert.equal(evaluateEnrollmentReadiness({...base,draft:{...base.draft,email:"JUGADOR@example.com"}}),"ready_for_transaction"));
