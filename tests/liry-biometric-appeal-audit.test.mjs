import test from "node:test";
import assert from "node:assert/strict";
import {previewAppealAudit,previewAppealClosure,previewAppealEventIntegrity,previewIndependentClosure,APPEAL_AUDIT_MODE} from "../lib/games/liry-biometric-appeal-audit.mjs";
const base={caseRef:"C-1",applicantRef:"applicant",originalReviewerRef:"reviewer-1",independentReviewerRef:"reviewer-2",actorRef:"reviewer-2",actorRole:"independent_appeals_reviewer",stage:"independent_review",eventType:"decision_recommended",applicantConsent:true,seq:2,previousSeq:1};
test("audit preview is always non-operational",()=>{
 assert.equal(APPEAL_AUDIT_MODE,"offline_preview_only");
 for(const p of [base,{...base,stage:"decision_recommended",eventType:"closure_proposed"}, {...base,stage:"appeal_requested",eventType:"reviewer_assigned"}]){
  const r=previewAppealAudit(p);
  for(const key of ["accepted","notified","accountChanged","persisted","closed"])assert.equal(r[key],false);
 }
});
test("prevent tampered references, order, unauthorized review, conflicts and missing consent",()=>{
 const cases=[[{seq:4},"invalid_sequence"],[{caseRef:""},"invalid_reference"],[{originalReviewerRef:"reviewer-2"},"conflict_of_interest"],[{applicantConsent:false},"consent_required"],[{actorRole:"platform_admin"},"unauthorized_reviewer"],[{stage:"closure_proposed",eventType:"evidence_reviewed"},"invalid_transition"],[{stage:"decision_recommended",eventType:"closure_proposed",legalHold:true},"legal_hold"]];
 for(const [patch,reason] of cases)assert.equal(previewAppealAudit({...base,...patch}).reason,reason);
 assert.equal(previewAppealAudit(base).reason,"requires_authenticated_server");
});
test("bilingual closure is draft only",()=>{
 for(const lang of ["es","en"]){const x=previewAppealClosure(lang);assert.equal(x.sent,false);assert.equal(x.closed,false);assert.equal(x.accountChanged,false);assert.equal(x.status,"draft");assert.match(x.message,/documentos de identidad|identity documents/);}
});

test("duplicate, cross-case replay, stale stage and post-closure events fail closed",()=>{
 const base={caseRef:"C-1",eventId:"event-2",seenEventIds:["event-1"],previousSeq:1,seq:2,eventType:"decision_recommended",stage:"independent_review"};
 for(const [patch,reason] of [[{seenEventIds:["event-2"]},"duplicate_event"],[{previousCaseRef:"C-2"},"cross_case_replay"],[{seq:1},"invalid_sequence"],[{expectedStage:"appeal_requested"},"stale_stage"],[{previousEventType:"closure_proposed"},"already_proposed_closed"],[{eventType:"closure_proposed"},"invalid_transition"]]){
  assert.equal(previewAppealEventIntegrity({...base,...patch}).reason,reason);
 }
 assert.equal(previewAppealEventIntegrity(base).reason,"requires_authenticated_server");
});
test("closure needs independent third reviewer, no hold and completed process",()=>{
 const base={originalReviewerRef:"one",independentReviewerRef:"two",closingReviewerRef:"three",decisionRecorded:true,applicantNotified:true};
 for(const [patch,reason] of [[{closingReviewerRef:"two"},"separation_of_duties"],[{legalHold:true},"legal_hold"],[{decisionRecorded:false},"incomplete_process"],[{applicantNotified:false},"incomplete_process"]]){
  assert.equal(previewIndependentClosure({...base,...patch}).reason,reason);
 }
 const r=previewIndependentClosure(base);assert.equal(r.accepted,false);assert.equal(r.closed,false);assert.equal(r.reason,"requires_authenticated_server");
});
