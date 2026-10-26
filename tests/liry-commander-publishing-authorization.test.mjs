import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../app/admin/master/publishing/page.tsx",import.meta.url),"utf8");
test("publishing remains blocked without game-specific release authorization",()=>{
 const update=source.slice(source.indexOf("async function updateRelease"),source.indexOf("export default async function"));
 assert.match(update,/if\(\["approved","scheduled","live"\]\.includes\(status\)\)throw new Error\("game_specific_release_authorization_required"\)/);
 assert.match(update,/requirePublishingEditor\(\)/);
});

test("publishing cards expose individual game and release IDs without approval",()=>{
 assert.match(source,/Identificador del videojuego: <code>\{r\.game_id\}<\/code>/);
 assert.match(source,/Identificador del lanzamiento: <code>\{r\.id\}<\/code>/);
});

test("release cards state individual authorization remains unavailable",()=>{
 assert.match(source,/Autorización individual vinculada al videojuego y al lanzamiento: PENDIENTE DE IMPLEMENTACIÓN/);
 assert.match(source,/Ningún estado administrativo concede permiso de publicación/);
});

test("publishing uses a read-only incomplete evidence checklist",()=>{
 assert.match(source,/reviewGameReleaseApprovalEvidence\(\{gameId:r\.game_id,releaseId:r\.id\},null\)/);
 assert.match(source,/Autorización individual: NO VERIFICADA/);
});
