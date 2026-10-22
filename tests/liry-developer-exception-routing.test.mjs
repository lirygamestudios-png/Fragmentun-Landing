import test from "node:test";
import assert from "node:assert/strict";
import {classifyDeveloperException,LIRY_DEVELOPER_EXCEPTION_AUTOMATION_ENABLED} from "../lib/games/liry-developer-exception-routing.ts";
test("automation remains off; no exception can approve itself",()=>{
 assert.equal(LIRY_DEVELOPER_EXCEPTION_AUTOMATION_ENABLED,false);
 for(const kind of ["missing_document","unreadable_document","expired_document","identity_mismatch","bank_beneficiary_mismatch","ip_ownership_dispute","suspected_fraud"]){
  assert.equal(classifyDeveloperException(kind).autoApprove,false);
 }
});
test("routine corrections guide the applicant",()=>{
 assert.equal(classifyDeveloperException("missing_document").owner,"applicant");
 assert.equal(classifyDeveloperException("expired_document").priority,"routine");
});
test("bank identity rights and fraud exceptions escalate to appropriate reviewers",()=>{
 assert.equal(classifyDeveloperException("bank_beneficiary_mismatch").owner,"payout_reviewer");
 assert.equal(classifyDeveloperException("identity_mismatch").owner,"identity_reviewer");
 assert.equal(classifyDeveloperException("ip_ownership_dispute").owner,"ip_reviewer");
 assert.equal(classifyDeveloperException("suspected_fraud").priority,"critical");
});
