import test from "node:test";import assert from "node:assert/strict";import {getLiryAuthFlow,isLiryAuthFlowEnabled} from "../lib/games/liry-auth-flow-contract.ts";
test("Las seis pantallas de acceso están definidas sin habilitar envíos",()=>{
 for(const screen of ["sign_in","register","recover","change_password","verify_email","sessions"]){
  assert.equal(getLiryAuthFlow(screen).canSubmit,false);
  assert.equal(isLiryAuthFlowEnabled(screen),false);
 }
});
test("Modificar contraseña y sesiones requiere identidad autenticada",()=>{
 assert.equal(getLiryAuthFlow("change_password").requiresAuthenticatedSession,true);
 assert.equal(getLiryAuthFlow("sessions").requiresAuthenticatedSession,true);
 assert.equal(getLiryAuthFlow("recover").requiresAuthenticatedSession,false);
});
