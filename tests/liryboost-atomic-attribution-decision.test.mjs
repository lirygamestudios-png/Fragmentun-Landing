import test from "node:test";
import assert from "node:assert/strict";
import {reviewAtomicAttributionDecision,reviewTransactionBoundAttribution} from "../lib/liryboost/atomic-attribution-decision.ts";
const ref="123e4567-e89b-42d3-a456-426614174000";
const invited="123e4567-e89b-42d3-a456-426614174001";
const a={source:"central_database",confirmed:true,status:"committed",referrerUserId:ref,inviteeUserId:invited};
const e={programActive:true,referrerEligible:true,inviteeEligible:true,referrerConsentCurrent:true,inviteeConsentCurrent:true,atomicEligibilityConfirmed:true};
const c={source:"central_database",committed:true,status:"won",claimedInviteeId:invited,winningReferrerId:ref};
test("elegibilidad y adjudicación coinciden",()=>assert.deepEqual(reviewAtomicAttributionDecision(ref,invited,a,e,c),{creditable:true,reason:"eligible_winner"}));
test("no acredita si programa está cerrado",()=>assert.equal(reviewAtomicAttributionDecision(ref,invited,a,{...e,programActive:false},c).creditable,false));
test("no acredita sin consentimiento vigente",()=>assert.equal(reviewAtomicAttributionDecision(ref,invited,a,{...e,referrerConsentCurrent:false},c).creditable,false));
test("no acredita si la atribución pertenece a otro",()=>assert.equal(reviewAtomicAttributionDecision(ref,invited,{...a,referrerUserId:invited},e,c).creditable,false));
test("no acredita cuando el invitado ya tiene ganador",()=>assert.deepEqual(reviewAtomicAttributionDecision(ref,invited,a,e,{...c,status:"already_claimed"}),{creditable:false,reason:"not_winner"}));
test("no acredita decisiones sin confirmación central",()=>assert.equal(reviewAtomicAttributionDecision(ref,invited,a,e,{...c,committed:false}).creditable,false));

const tx={transactionId:"123e4567-e89b-42d3-a456-426614174009",committed:true,source:"central_database"};
test("no acredita cuando evidencias provienen de transacciones distintas",()=>{
 assert.deepEqual(reviewTransactionBoundAttribution(ref,invited,a,e,c,tx,{...tx,transactionId:"123e4567-e89b-42d3-a456-426614174010"}),{creditable:false,reason:"transaction_unverified"});
});
test("no acredita si falta confirmación de transacción",()=>{
 assert.equal(reviewTransactionBoundAttribution(ref,invited,a,e,c,tx,{...tx,committed:false}).creditable,false);
});
test("transacción compartida permite aplicar validaciones restantes",()=>{
 assert.deepEqual(reviewTransactionBoundAttribution(ref,invited,a,e,c,tx,tx),{creditable:true,reason:"eligible_winner"});
});
