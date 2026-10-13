import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const code=readFileSync(new URL("../app/api/lirygames/liry-id/access/route.ts",import.meta.url),"utf8");
test("LIRY ID remains unavailable with HTTP 503",()=>{
 assert.match(code,/status:503/);
 assert.match(code,/liry_id_unavailable/);
 assert.match(code,/no-store, max-age=0/);
});
test("LIRY ID does not create accounts or authenticate using admin",()=>{
 assert.doesNotMatch(code,/signUp\(|signInWithPassword\(|createUser\(|service_role|createSupabaseServerClient/);
 assert.match(code,/LIRY_ID_PUBLIC_ACCESS/);
});
