import test from "node:test";
import assert from "node:assert/strict";
import {classifyStoredConsentOutcome} from "../lib/liryboost/consent-persistence-outcome.ts";
const fingerprint="123e4567-e89b-42d3-a456-426614174000:123e4567-e89b-42d3-a456-426614174001";
test("reconoce transacción confirmada y clave coincidente",()=>{
 assert.deepEqual(classifyStoredConsentOutcome(fingerprint,{status:"committed",confirmed:true,storedOperationFingerprint:fingerprint}),{acknowledged:true,status:"committed"});
});
test("reintento previamente confirmado no crea nueva aceptación",()=>{
 assert.deepEqual(classifyStoredConsentOutcome(fingerprint,{status:"replayed",confirmed:true,storedOperationFingerprint:fingerprint}),{acknowledged:true,status:"replayed"});
});
test("rechaza conflicto confirmado",()=>{
 assert.deepEqual(classifyStoredConsentOutcome(fingerprint,{status:"conflict",confirmed:true,storedOperationFingerprint:fingerprint}),{acknowledged:false,status:"conflict"});
});
test("rechaza operaciones sin confirmación",()=>{
 assert.equal(classifyStoredConsentOutcome(fingerprint,{status:"committed",confirmed:false,storedOperationFingerprint:fingerprint}).status,"unconfirmed");
});
test("rechaza respuesta confirmada para clave distinta",()=>{
 assert.equal(classifyStoredConsentOutcome(fingerprint,{status:"replayed",confirmed:true,storedOperationFingerprint:"different"}).status,"unconfirmed");
});
