import test from "node:test";
import assert from "node:assert/strict";
import {inspectInactiveGameEventAdmission} from "../lib/games/liry-game-event-policy.ts";
const event={eventId:"evt_12345678",accountId:"user_12345678",publicGameCode:"LIRY // ARENA-01",occurredAt:"2026-10-10T12:00:00Z",experiencePoints:15};
const ctx={sourceAuthorized:true,accountId:event.accountId,publicGameCode:event.publicGameCode};
test("el sistema inactivo no admite eventos aunque tengan forma válida",()=>{
 assert.deepEqual(inspectInactiveGameEventAdmission([event],ctx),{accepted:false,reason:"inactive"});
});
test("el emisor no autorizado queda rechazado",()=>{
 assert.equal(inspectInactiveGameEventAdmission([event],{...ctx,sourceAuthorized:false}).reason,"unauthorized_source");
});
test("cuenta y videojuego distintos quedan rechazados",()=>{
 assert.equal(inspectInactiveGameEventAdmission([event],{...ctx,accountId:"user_87654321"}).reason,"wrong_account");
 assert.equal(inspectInactiveGameEventAdmission([event],{...ctx,publicGameCode:"LIRY // BOT-02"}).reason,"wrong_game");
});
test("los eventos duplicados se rechazan antes de comprobar autorización",()=>{
 assert.equal(inspectInactiveGameEventAdmission([event,event],ctx).reason,"duplicate_event");
});
