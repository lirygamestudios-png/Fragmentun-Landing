import test from "node:test";
import assert from "node:assert/strict";
import {inspectInvitationBatch,canCreditInactiveLiryBoostInvitation} from "../lib/liryboost/invitation-integrity.ts";
const inv={invitationId:"invite_12345678",referrerId:"member_12345678",inviteeId:"member_87654321",verified:true,consent:true};
test("autorreferencias no son invitaciones válidas",()=>{assert.equal(inspectInvitationBatch([{...inv,inviteeId:inv.referrerId}]),"self_referral")});
test("IDs duplicados e invitados repetidos quedan rechazados",()=>{
 assert.equal(inspectInvitationBatch([inv,inv]),"duplicate");
 assert.equal(inspectInvitationBatch([inv,{...inv,invitationId:"invite_87654321"}]),"duplicate");
});
test("sin verificación o consentimiento no hay invitación acreditable",()=>{
 assert.equal(inspectInvitationBatch([{...inv,verified:false}]),"unverified");
 assert.equal(inspectInvitationBatch([{...inv,consent:false}]),"unverified");
});
test("una invitación aparentemente válida requiere revisión del servidor y no da puntos",()=>{
 assert.equal(inspectInvitationBatch([inv]),"eligible_for_server_review");
 assert.equal(canCreditInactiveLiryBoostInvitation(),false);
});
