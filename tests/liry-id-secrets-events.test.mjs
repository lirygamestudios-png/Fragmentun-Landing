import test from "node:test";
import assert from "node:assert/strict";
import {inspectInactiveSecretEvents,canGrantInactiveSecretReward} from "../lib/games/liry-secrets-event-integrity.ts";
const item={eventId:"event_12345678",accountId:"account_12345678",secretCode:"LIRY-SECRET-001",verifiedByGameServer:true};
test("solo se admiten identificadores de evento y secreto estructuralmente válidos",()=>{
 assert.equal(inspectInactiveSecretEvents([{...item,secretCode:"unregistered title"}]),"invalid");
});
test("eventos repetidos y secretos repetidos por cuenta se detectan",()=>{
 assert.equal(inspectInactiveSecretEvents([item,item]),"duplicate");
 assert.equal(inspectInactiveSecretEvents([item,{...item,eventId:"event_87654321"}]),"duplicate");
});
test("completación sin comprobación del servidor nunca se acredita",()=>{
 assert.equal(inspectInactiveSecretEvents([{...item,verifiedByGameServer:false}]),"unverified");
});
test("aun con un evento válido, ninguna recompensa está activa",()=>{
 assert.equal(inspectInactiveSecretEvents([item]),"inactive");
 assert.equal(canGrantInactiveSecretReward(),false);
});
