import test from "node:test";
import assert from "node:assert/strict";
import {validateInactiveOrderQuote,canChargeInactiveOrder} from "../lib/games/liry-commerce-order-integrity.ts";
const quote={currency:"USD",lines:[{publicCode:"LIRY_ITEM_01",unitPriceMinor:299,quantity:2}],quotedTotalMinor:598};
test("pedidos con totales alterados quedan rechazados",()=>{assert.equal(validateInactiveOrderQuote({...quote,quotedTotalMinor:1}),"price_mismatch")});
test("cantidades y precios negativos, fraccionarios o desbordados se rechazan",()=>{
 for(const quantity of [-1,0,1.5,101])assert.equal(validateInactiveOrderQuote({...quote,lines:[{...quote.lines[0],quantity}]}),"invalid");
 assert.equal(validateInactiveOrderQuote({...quote,lines:[{...quote.lines[0],unitPriceMinor:-10}]}),"invalid");
});
test("líneas duplicadas y monedas desconocidas se rechazan",()=>{
 assert.equal(validateInactiveOrderQuote({...quote,lines:[...quote.lines,...quote.lines]}),"invalid");
 assert.equal(validateInactiveOrderQuote({...quote,currency:"FAKE"}),"invalid");
});
test("cotización aritméticamente válida no activa pagos",()=>{
 assert.equal(validateInactiveOrderQuote(quote),"inactive");
 assert.equal(canChargeInactiveOrder(),false);
});
