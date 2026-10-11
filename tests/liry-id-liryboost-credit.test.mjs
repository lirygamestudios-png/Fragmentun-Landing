import test from "node:test";
import assert from "node:assert/strict";
import {inspectInactiveInvitationCredit} from "../lib/liryboost/invitation-credit-policy.ts";
const invitation={invitationId:"invite_12345678",referrerId:"member_12345678",inviteeId:"member_87654321",verified:true,consent:true};
const approved={programActive:true,rulesPublished:true,issuerAuthorized:true,identitiesVerified:true,consentsAudited:true,persistentDeduplication:true};
test("LiryBoost inactivo nunca acredita invitaciones",()=>{
 assert.equal(inspectInactiveInvitationCredit([invitation],{...approved,programActive:false}),"inactive");
 assert.equal(inspectInactiveInvitationCredit([invitation],approved),"inactive");
});
test("sin permisos de origen o deduplicación persistente no se acredita",()=>{
 assert.equal(inspectInactiveInvitationCredit([invitation],{...approved,issuerAuthorized:false}),"requires_verification");
 assert.equal(inspectInactiveInvitationCredit([invitation],{...approved,persistentDeduplication:false}),"requires_verification");
});
test("registros inconsistentes o autorreferencias son inválidos",()=>{
 assert.equal(inspectInactiveInvitationCredit([{...invitation,inviteeId:invitation.referrerId}],approved),"invalid");
 assert.equal(inspectInactiveInvitationCredit([{...invitation,consent:false}],approved),"invalid");
});
