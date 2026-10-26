import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../app/admin/master/games/worlds/page.tsx",import.meta.url),"utf8");
test("internal world editor rejects credential-bearing and non-HTTPS links",()=>{
 assert.match(source,/parsed\.protocol!=="https:"\|\|!parsed\.hostname\|\|parsed\.username\|\|parsed\.password/);
 assert.match(source,/publication_requires_release_gate/);
});
