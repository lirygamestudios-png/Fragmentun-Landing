import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const page=readFileSync(new URL("../app/lirygames/page.tsx",import.meta.url),"utf8");
const dialog=readFileSync(new URL("../components/LiryDeveloperAccess.tsx",import.meta.url),"utf8");
test("jugador y desarrollador disponen de entradas separadas",()=>{assert.match(page,/<LiryIdAccess \/>/);assert.match(page,/<LiryDeveloperAccess \/>/)});
test("desarrollador tiene subpantalla modal",()=>{assert.match(dialog,/<dialog /);assert.match(dialog,/showModal\(/)});
test("desarrollador solo premium y freemium",()=>assert.match(dialog,/Premium y Freemium/));
test("no hay recolección de credenciales ni archivos todavía",()=>{assert.doesNotMatch(dialog,/type="file"|type="password"|fetch\(|signUp\(/);assert.match(dialog,/SOLICITUDES DESACTIVADAS/)});
