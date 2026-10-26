import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../app/admin/master/publishing/page.tsx",import.meta.url),"utf8");
test("game publishing omits unrelated editorial metrics",()=>{
 assert.doesNotMatch(source,/supabase\.from\("book_editions"\)/);
 assert.doesNotMatch(source,/amazon_click/);
 assert.doesNotMatch(source,/<small>(?:Ediciones|Clics en Amazon)<\/small>/);
});
test("game publishing still requires individual release authorization",()=>{
 assert.match(source,/game_specific_release_authorization_required/);
});
