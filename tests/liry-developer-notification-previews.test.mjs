import test from "node:test";
import assert from "node:assert/strict";
import {prepareDeveloperNotification,LIRY_DEVELOPER_NOTIFICATIONS_ENABLED} from "../lib/games/liry-developer-notification-previews.ts";
test("notifications are drafts only and never enabled",()=>{
 assert.equal(LIRY_DEVELOPER_NOTIFICATIONS_ENABLED,false);
});
test("routine documentary issues request correction in both languages",()=>{
 for(const locale of ["es","en"]){
  const draft=prepareDeveloperNotification("missing_document",locale);
  assert.equal(draft.audience,"applicant");
  assert.equal(draft.documentStatus,"correction_required");
  assert.equal(draft.requiresHumanReview,false);
  assert.ok(draft.subject.length>0);
 }
});
test("sensitive bank, rights, identity and fraud events route to internal review",()=>{
 for(const kind of ["identity_mismatch","bank_beneficiary_mismatch","ip_ownership_dispute","suspected_fraud"]){
  const draft=prepareDeveloperNotification(kind,"es");
  assert.equal(draft.audience,"internal_review");
  assert.equal(draft.documentStatus,"under_review");
  assert.equal(draft.requiresHumanReview,true);
 }
});
