import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../app/admin/master/page.tsx",import.meta.url),"utf8");
test("Commander dashboard does not query unrelated books data",()=>{
 assert.doesNotMatch(source,/supabase\.from\("books"\)/);
 assert.doesNotMatch(source,/bookCount/);
});
