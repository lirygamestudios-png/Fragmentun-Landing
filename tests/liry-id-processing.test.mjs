import test from "node:test";
import assert from "node:assert/strict";
import {decideInactiveEventRequest,simulateSerialIdempotency} from "../lib/games/liry-event-processing-model.ts";
const valid={issuerId:"game-server-1",eventId:"game-event-1",issuerAuthorized:true,issuerRevoked:false,wellFormed:true};
test("reintento del mismo evento se reconoce sin doble procesamiento",()=>{
 assert.deepEqual(simulateSerialIdempotency([valid,valid]),["new","duplicate"]);
});
test("emisor revocado o no autorizado se rechaza",()=>{
 assert.equal(decideInactiveEventRequest({...valid,issuerRevoked:true},new Set()),"revoked");
 assert.equal(decideInactiveEventRequest({...valid,issuerAuthorized:false},new Set()),"unauthorized");
});
test("evento malformado no entra en el modelo de idempotencia",()=>{
 assert.equal(decideInactiveEventRequest({...valid,wellFormed:false},new Set()),"invalid");
});
test("emisores diferentes mantienen espacios de idempotencia independientes",()=>{
 assert.deepEqual(simulateSerialIdempotency([valid,{...valid,issuerId:"game-server-2"},valid]),["new","new","duplicate"]);
});
