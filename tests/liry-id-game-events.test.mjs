import test from "node:test";
import assert from "node:assert/strict";
import {isWellFormedGameEvent,hasDuplicateEventIds} from "../lib/games/liry-game-event-contract.ts";
const event={eventId:"evt_12345678",accountId:"user_12345678",publicGameCode:"LIRY // ARENA-01",occurredAt:"2026-10-10T12:00:00Z",experiencePoints:15};
test("evento futuro con forma válida no acredita XP por sí solo",()=>{assert.equal(isWellFormedGameEvent(event),true)});
test("rechazar código privado o no publicado y XP negativo/fraccionario",()=>{
 for(const changes of [{publicGameCode:"NOMBRE PRIVADO"},{experiencePoints:-1},{experiencePoints:2.5},{experiencePoints:Infinity}])assert.equal(isWellFormedGameEvent({...event,...changes}),false);
});
test("rechazar eventos futuros, identificadores incorrectos y fechas inválidas",()=>{
 for(const changes of [{occurredAt:"2099-01-01T00:00:00Z"},{occurredAt:"no-es-fecha"},{eventId:"x"},{accountId:"bad id"}])assert.equal(isWellFormedGameEvent({...event,...changes}),false);
});
test("detectar eventos duplicados en un mismo lote",()=>{
 assert.equal(hasDuplicateEventIds([event,{...event,publicGameCode:"LIRY // BOT-02"}]),true);
 assert.equal(hasDuplicateEventIds([event,{...event,eventId:"evt_87654321"}]),false);
});
