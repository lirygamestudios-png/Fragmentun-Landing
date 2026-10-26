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

test("storefront activation cannot occur through preparatory editor",()=>{
 assert.match(source,/const active=String\(formData\.get\("active"\)\|\|"false"\)==="true"/);
 assert.match(source,/if\(active\)throw new Error\("storefront_activation_requires_explicit_authorization"\)/);
});

test("storefront editor defaults to inactive and has no activation option",()=>{
 assert.match(source,/name="active" defaultValue="false"/);
 assert.match(source,/No · pendiente de autorización/);
 assert.doesNotMatch(source,/<option value="true">Sí<\/option>/);
});

test("storefront cannot be marked verified without external evidence",()=>{
 assert.equal((source.match(/storefront_verification_requires_external_evidence/g)||[]).length,2);
 assert.doesNotMatch(source,/<option value="verified">Verificada<\/option>/);
});

test("storefront verification requires external evidence",()=>{
 assert.equal((source.match(/storefront_verification_requires_external_evidence/g)||[]).length,2);
 assert.doesNotMatch(source,/<option value="verified">Verificada<\/option>/);
});

test("new storefront records default to explicitly inactive",()=>{
 assert.match(source,/account_status:accountStatus,active:false,created_by:user\.id/);
});
