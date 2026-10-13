import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const route=readFileSync(new URL("../app/api/lirygames/liry-id/status/route.ts",import.meta.url),"utf8");
test("estado público usa el contrato gamer separado",()=>assert.match(route,/LIRY_ID_PUBLIC_ACCESS/));
test("la ruta no lee credenciales ni sesiones del admin",()=>{assert.doesNotMatch(route,/createServerClient|service_role|cookies\(|auth\.getUser/);assert.match(route,/Cache-Control/);});
test("la ruta no habilita registro ni crea usuarios",()=>{assert.doesNotMatch(route,/signUp\(|createUser\(|POST\(/);assert.match(route,/registrationEnabled/);});
