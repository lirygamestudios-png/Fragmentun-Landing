import test from "node:test";
import assert from "node:assert/strict";
import {nextInactiveSettlementState,canExecuteInactiveSettlement} from "../lib/games/liry-commerce-settlement-contract.ts";
const verified={paymentProviderVerified:true,gameServerVerified:true};
test("un pago no se confirma sin verificación del proveedor",()=>{
 assert.equal(nextInactiveSettlementState("payment_pending","confirm_server_payment",{...verified,paymentProviderVerified:false}),null);
});
test("la entrega digital exige verificación del servidor del juego",()=>{
 assert.equal(nextInactiveSettlementState("paid_verified","start_delivery",{...verified,gameServerVerified:false}),null);
 assert.equal(nextInactiveSettlementState("delivery_pending","confirm_server_delivery",{...verified,gameServerVerified:false}),null);
});
test("la secuencia de estados de compra es explícita y no salta pasos",()=>{
 assert.equal(nextInactiveSettlementState("created","start_payment",verified),"payment_pending");
 assert.equal(nextInactiveSettlementState("payment_pending","confirm_server_payment",verified),"paid_verified");
 assert.equal(nextInactiveSettlementState("paid_verified","start_delivery",verified),"delivery_pending");
 assert.equal(nextInactiveSettlementState("delivery_pending","confirm_server_delivery",verified),"delivered");
 assert.equal(nextInactiveSettlementState("created","confirm_server_delivery",verified),null);
});
test("fallos no generan ítems, pagos ni liquidaciones activas",()=>{
 assert.equal(nextInactiveSettlementState("payment_pending","mark_failed",verified),"failed");
 assert.equal(nextInactiveSettlementState("delivered","mark_failed",verified),null);
 assert.equal(canExecuteInactiveSettlement(),false);
});
