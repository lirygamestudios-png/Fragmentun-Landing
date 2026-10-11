import test from "node:test";
import assert from "node:assert/strict";
import {planInactiveEventRecovery,prepareInactiveAuditRecord} from "../lib/games/liry-event-recovery-contract.ts";
test("fallos temporales permiten reintentos limitados",()=>{
 assert.equal(planInactiveEventRecovery("network_timeout",0),"retry");
 assert.equal(planInactiveEventRecovery("storage_unavailable",2),"retry");
 assert.equal(planInactiveEventRecovery("storage_unavailable",3),"quarantine");
});
test("resultado de transacción desconocido exige conciliación, no repetir XP",()=>{
 assert.equal(planInactiveEventRecovery("unknown_commit",1),"reconcile");
});
test("eventos no autorizados o inválidos no deben reintentarse",()=>{
 assert.equal(planInactiveEventRecovery("unauthorized",0),"reject");
 assert.equal(planInactiveEventRecovery("invalid_event",0),"reject");
});
test("auditoría mínima no incluye identidad ni contenido del evento",()=>{
 const item=prepareInactiveAuditRecord("network_timeout",1,"2026-10-11T10:00:00Z");
 assert.deepEqual(item,{outcome:"retry",category:"network_timeout",attempt:1,recordedAt:"2026-10-11T10:00:00Z"});
 assert.equal(prepareInactiveAuditRecord("invalid_event",-1,"2026-10-11T10:00:00Z"),null);
 assert.equal(prepareInactiveAuditRecord("invalid_event",1,"invalid"),null);
});

test("categorías desconocidas y marcas temporales futuras se rechazan",()=>{
 assert.equal(planInactiveEventRecovery("unexpected_error",0),"quarantine");
 assert.equal(prepareInactiveAuditRecord("unexpected_error",1,"2026-10-11T10:00:00Z"),null);
 assert.equal(prepareInactiveAuditRecord("network_timeout",1,"2099-01-01T00:00:00Z"),null);
});
