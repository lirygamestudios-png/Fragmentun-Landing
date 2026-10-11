import test from "node:test";
import assert from "node:assert/strict";
import {inspectInactiveCommerceRecovery,canAutomaticallyRepayOrRedeliverInactiveOrder} from "../lib/games/liry-commerce-recovery-contract.ts";
test("un pago de resultado desconocido exige conciliación, no otro cobro",()=>{
 assert.equal(inspectInactiveCommerceRecovery("unknown_payment_commit",1),"reconcile_payment");
});
test("entrega de resultado desconocido exige conciliación antes de duplicarla",()=>{
 assert.equal(inspectInactiveCommerceRecovery("unknown_delivery_commit",1),"reconcile_delivery");
});
test("tiempos de espera admiten consulta limitada pero no pagos ni entregas automáticos",()=>{
 assert.equal(inspectInactiveCommerceRecovery("payment_timeout",0),"retry_lookup");
 assert.equal(inspectInactiveCommerceRecovery("delivery_timeout",3),"manual_review");
 assert.equal(canAutomaticallyRepayOrRedeliverInactiveOrder(),false);
});
test("recibos inválidos y proveedores no autorizados se rechazan",()=>{
 assert.equal(inspectInactiveCommerceRecovery("invalid_receipt",0),"reject");
 assert.equal(inspectInactiveCommerceRecovery("unauthorized_provider",0),"reject");
});
