import test from "node:test";
import assert from "node:assert/strict";
import {inspectInactiveTransactionBatch,canSettleInactiveCommercePayment} from "../lib/games/liry-commerce-transaction-contract.ts";
const attempt={orderId:"order_12345678",paymentAttemptId:"attempt_12345678",accountId:"account_12345678",currency:"USD",amountMinor:599};
test("intentros de pago duplicados se detectan",()=>{
 assert.equal(inspectInactiveTransactionBatch([attempt,attempt]),"duplicate_attempt");
});
test("intentos de diferentes pedidos, cuentas o importes no se mezclan",()=>{
 for(const changes of [{orderId:"order_87654321"},{accountId:"account_87654321"},{amountMinor:899},{currency:"DOP"}]){
  assert.equal(inspectInactiveTransactionBatch([attempt,{...attempt,paymentAttemptId:"attempt_87654321",...changes}]),"mixed_order");
 }
});
test("importes y credenciales estructurales inválidos no se aceptan",()=>{
 for(const changes of [{amountMinor:-1},{amountMinor:1.5},{orderId:"?"},{currency:"FAKE"}]){
  assert.equal(inspectInactiveTransactionBatch([{...attempt,...changes}]),"invalid");
 }
});
test("un intento de pago correcto no puede liquidarse en el sistema inactivo",()=>{
 assert.equal(inspectInactiveTransactionBatch([attempt]),"inactive");
 assert.equal(canSettleInactiveCommercePayment(),false);
});
