import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../components/LiryGamerIdentity.tsx",import.meta.url),"utf8");
test("ignora selección de avatar obsoleta",()=>assert.match(src,/selection!==avatarSelection\.current/));
test("quitar avatar invalida verificaciones pendientes",()=>assert.match(src,/function removeAvatar\(\)\{\s*avatarSelection\.current\+\+/));
test("muestra error en diálogo accesible",()=>assert.match(src,/role="alert"/));
test("no muestra alertas bloqueantes",()=>assert.doesNotMatch(src,/window\.alert\(/));

test("el retrato del perfil sigue los cambios temporales de avatar",()=>{
 assert.match(src,/window\.addEventListener\("liry:avatar-changed",syncAvatar\)/);
 assert.match(src,/window\.removeEventListener\("liry:avatar-changed",syncAvatar\)/);
 assert.match(src,/window\.addEventListener\("pageshow",syncAvatar\)/);
 assert.match(src,/if\(avatarUrl\.current\)return/);
});
