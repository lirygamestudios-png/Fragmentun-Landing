import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const source=readFileSync(new URL("../app/admin/master/operations/page.tsx",import.meta.url),"utf8");
test("Commander operations has no Fragmentun book or character metrics",()=>{
 assert.doesNotMatch(source,/supabase\.from\("(?:books|characters)"\)/);
 assert.doesNotMatch(source,/<small>(?:Libros|Personajes)<\/small>/);
});
test("Commander operations displays operational work and alert metrics",()=>{
 assert.match(source,/<small>Trabajos abiertos<\/small><strong>\{open\.length\.toLocaleString\(\)\}/);
 assert.match(source,/<small>Alertas operativas<\/small><strong>\{blocked\.length\.toLocaleString\(\)\}/);
});
