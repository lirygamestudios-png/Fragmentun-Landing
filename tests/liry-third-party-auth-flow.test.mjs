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

test("La ventana Liry ID muestra estados de flujo y evita envío de credenciales",async()=>{const {readFileSync}=await import("node:fs");const source=readFileSync(new URL("../components/LiryIdAccess.tsx",import.meta.url),"utf8");assert.match(source,/getLiryAuthFlow\(/);assert.match(source,/data-can-submit=\{String\(flow\.canSubmit\)\}/);assert.doesNotMatch(source,/signInWithPassword|signUp\(|resetPasswordForEmail/);});

test("Las pantallas de acceso muestran campos deshabilitados sin aceptar credenciales",async()=>{const {readFileSync}=await import("node:fs");const source=readFileSync(new URL("../components/LiryIdAccess.tsx",import.meta.url),"utf8");assert.match(source,/<fieldset disabled/);assert.match(source,/type="email"/);assert.match(source,/type="password"/);assert.match(source,/autoComplete="off"/);});
