import test from "node:test";
import assert from "node:assert/strict";
import {INITIAL_DEVELOPER_GATE_STATE as init,applyTrustedDeveloperEvent as apply} from "../lib/games/liry-developer-trusted-gates.ts";
const ctx={providerSignatureVerified:true,staffAuthorizationVerified:true,bankAuthorityVerified:true,identityFeatureEnabled:true};
const identity={source:"verified_provider",kind:"identity_verified",reference:"provider-1"};
const rights={source:"authorized_reviewer",kind:"rights_approved",reference:"rights-1"};
const bank={source:"authorized_payouts",kind:"bank_verified",reference:"bank-1"};
const approve={source:"authorized_admissions",kind:"admission_approved",reference:"admin-1"};
test("feature disabled and unverified provider cannot advance identity",()=>{
 assert.deepEqual(apply(init,identity,{...ctx,identityFeatureEnabled:false}),init);
 assert.deepEqual(apply(init,identity,{...ctx,providerSignatureVerified:false}),init);
 assert.deepEqual(apply(init,{...identity,reference:" "},ctx),init);
});
test("identity or rights alone cannot approve developer",()=>{
 const id=apply(init,identity,ctx);
 const reviewed=apply(id,rights,ctx);
 assert.notEqual(apply(id,approve,ctx).admission,"approved");
 assert.notEqual(apply(reviewed,approve,ctx).admission,"approved");
});
test("bank verified needs separate authority; all three gates precede admission",()=>{
 const id=apply(init,identity,ctx);
 const reviewed=apply(id,rights,ctx);
 assert.equal(apply(reviewed,bank,{...ctx,bankAuthorityVerified:false}).bankVerified,false);
 const paid=apply(reviewed,bank,ctx);
 assert.equal(paid.bankVerified,true);
 assert.equal(apply(paid,approve,{...ctx,staffAuthorizationVerified:false}).admission,"rights_review");
 assert.equal(apply(paid,approve,ctx).admission,"approved");
});
test("rejection and expiry invalidate dependent checks",()=>{
 const reviewed=apply(apply(init,identity,ctx),rights,ctx);
 const paid=apply(reviewed,bank,ctx);
 const expired=apply(paid,{source:"verified_provider",kind:"verification_expired",reference:"provider-2"},ctx);
 assert.equal(expired.bankVerified,false);
 assert.equal(expired.rightsApproved,false);
 assert.notEqual(apply(expired,approve,ctx).admission,"approved");
 const rejected=apply(paid,{source:"authorized_payouts",kind:"bank_rejected",reference:"bank-2"},ctx);
 assert.equal(rejected.admission,"rejected");
 assert.equal(apply(rejected,approve,ctx).admission,"rejected");
});
