import test from "node:test";import assert from "node:assert/strict";import {assessDeveloperDraftWrite,simulateDeveloperDraftWrite,LIRY_DEVELOPER_DRAFT_SAVES_ENABLED} from "../lib/games/liry-developer-draft-revisions.ts";
const current={applicationId:"app_123456",ownerUserId:"owner_123456",revision:4,updatedAt:"2026-10-21T20:00:00Z"};
const req={applicationId:"app_123456",ownerUserId:"owner_123456",expectedRevision:4,authenticatedUserId:"owner_123456",sessionVerified:true,serverOwnershipVerified:true};
test("real developer draft saves remain disabled",()=>{assert.equal(LIRY_DEVELOPER_DRAFT_SAVES_ENABLED,false);assert.equal(assessDeveloperDraftWrite(current,req).reason,"disabled");});
test("stale revision cannot overwrite a newer draft from another device",()=>{assert.deepEqual(simulateDeveloperDraftWrite(current,{...req,expectedRevision:3}),{allowed:false,reason:"conflict",nextRevision:null});});
test("matching version may increment only in isolated simulation",()=>{assert.deepEqual(simulateDeveloperDraftWrite(current,req),{allowed:true,reason:"ready",nextRevision:5});});
test("different owner and unverified session cannot update",()=>{assert.equal(simulateDeveloperDraftWrite(current,{...req,authenticatedUserId:"other"}).reason,"unauthorized");assert.equal(simulateDeveloperDraftWrite(current,{...req,sessionVerified:false}).reason,"unauthorized");});
