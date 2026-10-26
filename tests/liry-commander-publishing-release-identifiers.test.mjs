import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../app/admin/master/publishing/page.tsx",import.meta.url),"utf8");
test("publishing release cards expose game and release identifiers",()=>{
 assert.match(source,/Identificador del videojuego: <code>\{r\.game_id\}<\/code>/);
 assert.match(source,/Identificador del lanzamiento: <code>\{r\.id\}<\/code>/);
 assert.match(source,/game_specific_release_authorization_required/);
});
