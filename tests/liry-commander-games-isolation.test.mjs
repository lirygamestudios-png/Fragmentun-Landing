import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../app/admin/master/games/page.tsx",import.meta.url),"utf8");
test("Commander games does not read unrelated books or characters",()=>{
 assert.doesNotMatch(source,/supabase\.from\("(?:books|characters)"\)/);
 assert.doesNotMatch(source,/<small>(?:Libros|Personajes)<\/small>/);
});
test("Commander games asset panel presents games and production milestones",()=>{
 assert.match(source,/<small>Videojuegos<\/small>/);
 assert.match(source,/<small>Etapas pendientes<\/small>/);
});
