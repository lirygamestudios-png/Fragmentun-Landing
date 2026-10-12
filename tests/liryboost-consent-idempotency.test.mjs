import test from "node:test";
import assert from "node:assert/strict";
import {reviewConsentOperation} from "../lib/liryboost/consent-idempotency.ts";
const actorId="123e4567-e89b-42d3-a456-426614174000";
const operationKey="123e4567-e89b-42d3-a456-426614174001";
const valid={actorId,operationKey,kind:"accepted",rulesVersion:"v1"};
test("operación válida produce identificador estable, no registro real",()=>{
 assert.deepEqual(reviewConsentOperation(valid),{valid:true,fingerprint:actorId+":"+operationKey});
});
test("el reintento tiene la misma identidad de operación",()=>{
 assert.deepEqual(reviewConsentOperation(valid),reviewConsentOperation({...valid,actorId:actorId.toUpperCase(),operationKey:operationKey.toUpperCase()}));
});
test("operaciones distintas tienen distinta clave",()=>{
 const other=reviewConsentOperation({...valid,operationKey:"123e4567-e89b-42d3-a456-426614174002"});
 assert.notDeepEqual(reviewConsentOperation(valid),other);
});
test("rechaza actor, clave, evento o versión incorrectos",()=>{
 assert.equal(reviewConsentOperation({...valid,actorId:"?"}).reason,"invalid_actor");
 assert.equal(reviewConsentOperation({...valid,operationKey:"short"}).reason,"invalid_key");
 assert.equal(reviewConsentOperation({...valid,kind:"overwrite"}).reason,"invalid_kind");
 assert.equal(reviewConsentOperation({...valid,rulesVersion:""}).reason,"invalid_rules");
});
