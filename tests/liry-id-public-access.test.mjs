import test from "node:test";
import assert from "node:assert/strict";
import {LIRY_ID_PUBLIC_ACCESS} from "../lib/games/liry-id-public-access.ts";
test("registro público permanece cerrado",()=>assert.equal(LIRY_ID_PUBLIC_ACCESS.registrationEnabled,false));
test("acceso público permanece cerrado",()=>assert.equal(LIRY_ID_PUBLIC_ACCESS.signInEnabled,false));
test("recuperación permanece cerrada",()=>assert.equal(LIRY_ID_PUBLIC_ACCESS.recoveryEnabled,false));
test("la fuente gamer es explícitamente independiente y pendiente",()=>assert.equal(LIRY_ID_PUBLIC_ACCESS.source,"pending_isolated_auth"));
