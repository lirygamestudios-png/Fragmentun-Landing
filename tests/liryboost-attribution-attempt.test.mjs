import test from "node:test";
import assert from "node:assert/strict";
import {classifyAttributionAttempt} from "../lib/liryboost/attribution-attempt.ts";
test("confirmada cuenta una vez",()=>assert.deepEqual(classifyAttributionAttempt({status:"confirmed",centralConfirmed:true}),{counted:true,retryAllowed:false,reason:"confirmed"}));
test("duplicada no cuenta de nuevo",()=>assert.deepEqual(classifyAttributionAttempt({status:"duplicate",centralConfirmed:true}),{counted:false,retryAllowed:false,reason:"duplicate"}));
test("rechazada no cuenta y admite nuevo intento elegible",()=>assert.deepEqual(classifyAttributionAttempt({status:"rejected",centralConfirmed:true}),{counted:false,retryAllowed:true,reason:"rejected"}));
test("sin confirmación central no concede ni sugiere reintento seguro",()=>assert.deepEqual(classifyAttributionAttempt({status:"confirmed",centralConfirmed:false}),{counted:false,retryAllowed:false,reason:"unverified"}));
test("estado inesperado nunca cuenta",()=>assert.equal(classifyAttributionAttempt({status:"pending",centralConfirmed:true}).counted,false));
