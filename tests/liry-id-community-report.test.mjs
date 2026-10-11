import test from "node:test";
import assert from "node:assert/strict";
import {validateCommunityReport,inspectInactiveReport,canBlockCommunityAccount} from "../lib/games/liry-community-report-contract.ts";
const valid={contentId:"post_12345678",reason:"spam",details:"Mensaje repetido"};
test("denuncias bien formadas permanecen desactivadas sin servicio",()=>{
 assert.equal(validateCommunityReport(valid),true);
 assert.equal(inspectInactiveReport(valid),"disabled");
});
test("rechazar denuncias con identificadores o motivos inválidos",()=>{
 assert.equal(inspectInactiveReport({...valid,contentId:"?"}),"invalid");
 assert.equal(inspectInactiveReport({...valid,reason:"inventado"}),"invalid");
});
test("rechazar contenido de denuncia fuera de límites",()=>{
 assert.equal(validateCommunityReport({...valid,details:"x".repeat(1001)}),false);
 assert.equal(validateCommunityReport({...valid,details:"hola\u0000"}),false);
});
test("no bloquear cuentas desde el FrontDesk inactivo",()=>{
 assert.equal(canBlockCommunityAccount(),false);
});
