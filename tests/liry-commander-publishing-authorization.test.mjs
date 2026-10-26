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

test("release cards show a read-only, incomplete individual approval checklist",()=>{
 assert.match(source,/Autorización individual: NO VERIFICADA/);
 assert.match(source,/reviewGameReleaseApprovalEvidence\(\{gameId:r\.game_id,releaseId:r\.id\},null\)\.missing\.join/);
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

test("new storefront records are created inactive regardless of database defaults",()=>{
 const create=source.slice(source.indexOf("async function createPlataforma"),source.indexOf("async function createRelease"));
 assert.match(create,/account_status:accountStatus,active:false,created_by:user\.id/);
});

test("new release registration requires an existing game record",()=>{
 const create=source.slice(source.indexOf("async function createRelease"),source.indexOf("async function updatePlataforma"));
 assert.match(create,/supabase\.from\("game_titles"\)\.select\("id"\)\.eq\("id",gameId\)/);
 assert.match(create,/release_game_not_found/);
});

test("release registration rejects missing optional storefront records",()=>{
 const create=source.slice(source.indexOf("async function createRelease"),source.indexOf("async function updatePlataforma"));
 assert.match(create,/if\(storefrontId\)/);
 assert.match(create,/supabase\.from\("publishing_storefronts"\)\.select\("id"\)\.eq\("id",storefrontId\)/);
 assert.match(create,/release_storefront_not_found/);
});
