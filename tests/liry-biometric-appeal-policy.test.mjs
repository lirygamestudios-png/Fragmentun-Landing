import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../lib/games/liry-biometric-appeal-policy.ts",import.meta.url),"utf8");
test("offline policy cannot enable decisions, messages or account mutations",()=>{
 for(const k of ['biometricProviderStatus==="disabled"',"eligible:false","canChangeAccount:false","canNotify:false","canPersist:false","sent:false","status:\"draft\""])assert.ok(source.includes(k),k);
 assert.doesNotMatch(source,/eligible:true|canNotify:true|canPersist:true|canChangeAccount:true|fetch\(|createClient\(/);
});
test("appeals require consent, independent review, legal hold protections and bilingual notices",()=>{
 for(const k of ["originalReviewerRef===input.independentReviewerRef","applicantRequested","consentToReview","legalHold","responseTargetBusinessDays","requiresLegalApprovalBeforePublication","previewAppealOutcome","No envíes documentos","Do not send identity documents"])assert.ok(source.includes(k),k);
});
