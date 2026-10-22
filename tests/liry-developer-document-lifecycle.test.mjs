import test from "node:test";
import assert from "node:assert/strict";
import {LIRY_DOCUMENT_INGESTION_ENABLED,nextDeveloperDocumentStatus,simulateDocumentTransition} from "../lib/games/liry-developer-document-lifecycle.ts";
test("real dossier intake and transitions remain disabled",()=>{
 assert.equal(LIRY_DOCUMENT_INGESTION_ENABLED,false);
 assert.equal(nextDeveloperDocumentStatus("not_submitted","received","applicant",true),"not_submitted");
 assert.equal(nextDeveloperDocumentStatus("under_review","verify","authorized_reviewer",true),"under_review");
});
test("review workflow allows corrections but not applicant self-verification",()=>{
 const received=simulateDocumentTransition("not_submitted","received","applicant");
 const review=simulateDocumentTransition(received,"start_review","authorized_reviewer");
 assert.equal(simulateDocumentTransition(review,"verify","applicant"),"under_review");
 const correction=simulateDocumentTransition(review,"request_correction","authorized_reviewer");
 assert.equal(simulateDocumentTransition(correction,"resubmitted","applicant"),"received");
});
test("deletion and expiry require retention service",()=>{
 assert.equal(simulateDocumentTransition("verified","expire","applicant"),"verified");
 assert.equal(simulateDocumentTransition("verified","expire","retention_service"),"expired");
 assert.equal(simulateDocumentTransition("expired","schedule_deletion","retention_service"),"deletion_scheduled");
 assert.equal(simulateDocumentTransition("deletion_scheduled","confirm_deletion","retention_service"),"deleted");
 assert.equal(simulateDocumentTransition("deleted","received","applicant"),"deleted");
});
