import test from "node:test";
import assert from "node:assert/strict";
import {inspectInactiveLiryBoostAbuse,canSanctionInactiveLiryBoostParticipant} from "../lib/liryboost/abuse-readiness.ts";
const item={referrerId:"member_12345678",inviteeId:"member_87654321",invitationId:"invite_12345678"};
test("invitaciones de forma válida no generan señales por sí solas",()=>{
 assert.deepEqual(inspectInactiveLiryBoostAbuse([item]),[]);
});
test("autorreferencia y duplicados requieren revisión, no sanción",()=>{
 const signals=inspectInactiveLiryBoostAbuse([item,{...item,invitationId:"invite_87654321"}, {...item,invitationId:"invite_98765432",inviteeId:item.referrerId}]);
 assert.ok(signals.includes("duplicate_invitees"));
 assert.ok(signals.includes("self_referral"));
 assert.ok(signals.includes("manual_review"));
 assert.equal(canSanctionInactiveLiryBoostParticipant(),false);
});
test("lotes malformados quedan identificados sin procesar",()=>{
 assert.deepEqual(inspectInactiveLiryBoostAbuse([]),["invalid_batch"]);
 assert.deepEqual(inspectInactiveLiryBoostAbuse([{...item,invitationId:"bad id"}]),["invalid_batch"]);
});
test("volumen elevado provoca revisión sin afirmar fraude",()=>{
 const batch=Array.from({length:26},(_,i)=>({referrerId:item.referrerId,inviteeId:"member_"+String(i+10000000),invitationId:"invite_"+String(i+10000000)}));
 const signals=inspectInactiveLiryBoostAbuse(batch);
 assert.ok(signals.includes("too_many_invites"));
 assert.ok(signals.includes("manual_review"));
});
