import test from "node:test";
import assert from "node:assert/strict";
import {inspectInactiveFulfillmentRefund,canDeliverOrRefundInactivePurchase} from "../lib/games/liry-commerce-fulfillment-refund.ts";
const item={orderId:"order_12345678",paymentReference:"payref_12345678",gameAccountId:"account_12345678",itemCode:"LIRY_ITEM_01",paymentServerVerified:true,gameServerVerified:true,alreadyDelivered:false,refundRequested:false,refundProviderVerified:false};
test("pago o servidor del juego sin verificar impiden entrega",()=>{
 assert.equal(inspectInactiveFulfillmentRefund({...item,paymentServerVerified:false}),"requires_reconciliation");
 assert.equal(inspectInactiveFulfillmentRefund({...item,gameServerVerified:false}),"requires_reconciliation");
});
test("artículo entregado requiere conciliación antes de otra entrega",()=>{
 assert.equal(inspectInactiveFulfillmentRefund({...item,alreadyDelivered:true}),"requires_reconciliation");
});
test("reembolso sin confirmación de proveedor requiere conciliación",()=>{
 assert.equal(inspectInactiveFulfillmentRefund({...item,refundRequested:true}),"requires_reconciliation");
});
test("identificadores inválidos se rechazan y no hay operaciones activas",()=>{
 assert.equal(inspectInactiveFulfillmentRefund({...item,itemCode:"?"}),"invalid");
 assert.equal(inspectInactiveFulfillmentRefund(item),"inactive");
 assert.equal(canDeliverOrRefundInactivePurchase(),false);
});
