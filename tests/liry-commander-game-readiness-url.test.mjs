import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../app/admin/master/games/readiness/page.tsx",import.meta.url),"utf8");
test("game readiness parses full HTTPS play URLs instead of string prefix",()=>{
 assert.match(source,/new URL\(value\)/);
 assert.match(source,/url\.protocol==="https:"/);
 assert.match(source,/!url\.username&&!url\.password/);
 assert.match(source,/validGamePlayUrl\(item\.play_url\)/);
 assert.doesNotMatch(source,/play_url\?\.startsWith\("https:\/\/"\)/);
});

test("three-world readiness lists precise blockers without approval actions",()=>{
 for(const label of ["No registrado","Acceso gratuito por corregir","Enlace HTTPS pendiente o inválido","Configuración registrada; publicación aún no autorizada"])assert.ok(source.includes(label));
 assert.match(source,/PUBLICACIÓN BLOQUEADA/);
});

test("internal world editor rejects HTTPS URLs with embedded credentials",()=>{
 const worlds=readFileSync(new URL("../app/admin/master/games/worlds/page.tsx",import.meta.url),"utf8");
 assert.match(worlds,/parsed\.protocol!=="https:"\|\|!parsed\.hostname\|\|parsed\.username\|\|parsed\.password/);
});

test("readiness shows bounded progress for three worlds without publication approval",()=>{
 assert.match(source,/const registeredWorlds=configured\.filter/);
 assert.match(source,/const technicallyConfigured=configured\.filter/);
 assert.match(source,/Mundos registrados: \{registeredWorlds\} de \{INITIAL_WORLDS_PER_GAME\}/);
 assert.match(source,/La configuración no concede permiso de publicación/);
});

test("individual game administrative ID remains visible without changing blocked publication",()=>{
 assert.match(source,/Identificador del videojuego: <code>\{game\.id\}<\/code>/);
 assert.match(source,/PUBLICACIÓN BLOQUEADA/);
});

test("readiness displays the exact game ID for release traceability",()=>{
 assert.match(source,/Identificador del videojuego: <code>\{game\.id\}<\/code>/);
 assert.match(source,/PUBLICACIÓN BLOQUEADA/);
});
