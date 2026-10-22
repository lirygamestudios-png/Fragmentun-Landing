import test from "node:test";
import assert from "node:assert/strict";
import {LIRY_DEVELOPER_LIVE_STATUS_ENABLED,projectDeveloperApplicantStatus} from "../lib/games/liry-developer-applicant-status.ts";
const record={applicationId:"app-1",ownerUserId:"developer-1",documentStatus:"received",reminderStatus:"pending",identityVerified:false,bankVerified:false,rightsApproved:false,admissionApproved:false};
test("live applicant status is disabled even for legitimate owner",()=>{
 assert.equal(LIRY_DEVELOPER_LIVE_STATUS_ENABLED,false);
 assert.equal(projectDeveloperApplicantStatus(record,{authenticatedUserId:"developer-1",sessionVerified:true,serverOwnershipVerified:true}),null);
});
test("unauthenticated or cross-account status never becomes visible",()=>{
 assert.equal(projectDeveloperApplicantStatus(record,{authenticatedUserId:"developer-2",sessionVerified:true,serverOwnershipVerified:true}),null);
 assert.equal(projectDeveloperApplicantStatus(record,{authenticatedUserId:"developer-1",sessionVerified:false,serverOwnershipVerified:true}),null);
});
