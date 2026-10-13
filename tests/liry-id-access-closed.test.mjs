import test from "node:test";
import assert from "node:assert/strict";
import {POST} from "../app/api/lirygames/liry-id/access/route.ts";
test("LIRY ID returns 503 and never creates an account",async()=>{
 const response=await POST();
 assert.equal(response.status,503);
 const body=await response.json();
 assert.equal(body.ok,false);
 assert.equal(body.error,"liry_id_unavailable");
 assert.equal(response.headers.get("cache-control"),"no-store, max-age=0");
});
