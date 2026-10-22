import test from "node:test";
import assert from "node:assert/strict";
import {createSafeDeveloperAuditEvent} from "../lib/games/liry-developer-audit-event.ts";
const base={eventId:"event_123456",applicationId:"app_123456",action:"document_received",actorType:"authorized_reviewer",actorReference:"reviewer_001",occurredAt:"2026-10-21T21:00:00.000Z",result:"accepted",correlationId:"trace_123456"};
test("audit trail records only minimal identifiers and authorized event metadata",()=>{
 const result=createSafeDeveloperAuditEvent({...base,bankStatement:"sensitive",faceScan:"data",providerToken:"secret"});
 assert.deepEqual(result,base);
 assert.equal(JSON.stringify(result).includes("sensitive"),false);
});
test("malformed references and invalid timestamp are rejected",()=>{
 assert.equal(createSafeDeveloperAuditEvent({...base,applicationId:"bank account 12345"}),null);
 assert.equal(createSafeDeveloperAuditEvent({...base,occurredAt:"not-a-date"}),null);
});
