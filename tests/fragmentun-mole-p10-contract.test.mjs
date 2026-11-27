import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const route=readFileSync(new URL("../app/api/integrations/mole/drafts/route.ts",import.meta.url),"utf8");

test("P10 Mole endpoint has only POST and PATCH write methods",()=>{
 assert.match(route,/export async function POST\(/);
 assert.match(route,/export async function PATCH\(/);
 assert.match(route,/export async function DELETE\(\)\{return rejected\("method_not_allowed",405\)/);
 assert.match(route,/export async function PUT\(\)\{return rejected\("method_not_allowed",405\)/);
});
test("P10 token must be hashed and compared in constant time",()=>{
 assert.match(route,/FRAGMENTUN_MOLE_TOKEN_SHA256/);
 assert.match(route,/createHash\("sha256"\)/);
 assert.match(route,/timingSafeEqual/);
 assert.match(route,/if\(!authorize\(request\)\)return rejected\("unauthorized",401\)/);
});
test("P10 disabled unless server-only configuration explicitly supplied",()=>{
 assert.doesNotMatch(route,/FRAGMENTUN_MOLE_SUPABASE_SERVICE_ROLE_KEY/);
 assert.doesNotMatch(route,/FRAGMENTUN_MOLE_EDITOR_UUID/);
 assert.match(route,/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
 assert.match(route,/fragmentun_mole_draft_upsert_v1/);
 assert.match(route,/if\(!db\)return rejected\("integration_disabled",503\)/);
 assert.doesNotMatch(route,/NEXT_PUBLIC_SUPABASE_SERVICE_ROLE/);
});
test("P10 input is allowlisted; publication cannot be requested",()=>{
 assert.match(route,/const fields=\["slug","title_es","title_en","excerpt_es","excerpt_en","body_es","body_en","image_url"\]/);
 assert.match(route,/Object\.keys\(data\)\.some\(k=>!allowed\.has\(k\)\)/);
 assert.match(route,/p_draft:\{\.\.\.parsed\.draft,image_url:parsed\.draft\.image_url\|\|null\}/);
});
test("P10 delegates ownership and publication checks to restricted DB RPC",()=>{
 assert.match(route,/db\.rpc\("fragmentun_mole_draft_upsert_v1"/);
 assert.match(route,/p_token:bearer/);
 assert.match(route,/p_id:update\?parsed\.id:null/);
 assert.doesNotMatch(route,/\.from\("fragmentun_blog_posts"\)\.(insert|update)/);
});
test("P10 preserves body size guard, duplicate-slug conflict and no-store",()=>{
 assert.match(route,/const maxBytes=125000/);
 assert.match(route,/Buffer\.byteLength\(raw,"utf8"\)>maxBytes/);
 assert.match(route,/slug_conflict/);
 assert.match(route,/"Cache-Control":"no-store"/);
});
