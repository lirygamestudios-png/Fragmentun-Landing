import test from "node:test";
import assert from "node:assert/strict";
import {canAccessDeveloperDossier as allowed,DEVELOPER_DOSSIER_UPLOADS_ENABLED} from "../lib/games/liry-developer-dossier-policy.ts";
const base={authenticated:true,applicationBound:true,staffGrantVerified:true};
test("uploads remain disabled even for authenticated applicants",()=>{
 assert.equal(DEVELOPER_DOSSIER_UPLOADS_ENABLED,false);
 assert.equal(allowed({...base,kind:"bank_statement",role:"applicant",action:"upload"}),false);
});
test("no unauthorized or cross-application dossier access",()=>{
 assert.equal(allowed({...base,applicationBound:false,kind:"bank_statement",role:"payout_reviewer",action:"read_sensitive"}),false);
 assert.equal(allowed({...base,authenticated:false,kind:"ip_rights_evidence",role:"rights_reviewer",action:"read_sensitive"}),false);
 assert.equal(allowed({...base,staffGrantVerified:false,kind:"bank_statement",role:"payout_reviewer",action:"read_sensitive"}),false);
});
test("payout and rights reviewers cannot read each other's documents",()=>{
 assert.equal(allowed({...base,kind:"bank_statement",role:"rights_reviewer",action:"read_sensitive"}),false);
 assert.equal(allowed({...base,kind:"ip_rights_evidence",role:"payout_reviewer",action:"read_sensitive"}),false);
 assert.equal(allowed({...base,kind:"bank_statement",role:"payout_reviewer",action:"read_sensitive"}),true);
 assert.equal(allowed({...base,kind:"ip_rights_evidence",role:"rights_reviewer",action:"read_sensitive"}),true);
});
test("only admissions officer may authorize admission; applicant sees status only",()=>{
 assert.equal(allowed({...base,kind:"admission_decision",role:"applicant",action:"approve"}),false);
 assert.equal(allowed({...base,kind:"admission_decision",role:"admission_officer",action:"approve"}),true);
 assert.equal(allowed({...base,kind:"admission_decision",role:"applicant",action:"view_status"}),true);
});
