import test from "node:test";
import assert from "node:assert/strict";
import {preflightReleaseReviewAuditAppend} from "../lib/games/game-release-audit-preflight.ts";
const draft={gameId:"game-1",releaseId:"release-1",deploymentId:"dpl_123",commitSha:"a".repeat(40),validationRunId:"run-1",actorUserId:"admin-1",decision:"approved",recordedAt:"2026-10-26T17:00:00.000Z",readiness:"ready",reasons:[],publishAuthorized:false};
const trusted={actorUserId:"admin-1",gameId:"game-1",releaseId:"release-1",deploymentId:"dpl_123",commitSha:"a".repeat(40),validationRunId:"run-1",idempotencyKey:"event_unique_12345",alreadyExists:false};
test("valid audit metadata passes preflight without granting publication",()=>{
 const r=preflightReleaseReviewAuditAppend(draft,trusted);assert.equal(r.accepted,true);assert.equal(r.publishAuthorized,false);
});
test("forged actor and foreign release are blocked",()=>{
 const r=preflightReleaseReviewAuditAppend({...draft,actorUserId:"other",releaseId:"foreign"},trusted);
 assert.equal(r.accepted,false);assert.ok(r.reasons.includes("actor_mismatch"));assert.ok(r.reasons.includes("release_mismatch"));
});
test("duplicate and forged version evidence are blocked",()=>{
 const r=preflightReleaseReviewAuditAppend({...draft,commitSha:"b".repeat(40)},{...trusted,alreadyExists:true});
 assert.equal(r.accepted,false);assert.ok(r.reasons.includes("duplicate_audit_event"));assert.ok(r.reasons.includes("evidence_mismatch"));
});
test("client attempt to grant publication is rejected",()=>{
 const r=preflightReleaseReviewAuditAppend({...draft,publishAuthorized:true},trusted);
 assert.equal(r.accepted,false);assert.ok(r.reasons.includes("publication_grant_forbidden"));
});
