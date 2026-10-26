import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../app/admin/master/publishing/page.tsx",import.meta.url),"utf8");
test("publishing remains blocked without game-specific release authorization",()=>{
 const update=source.slice(source.indexOf("async function updateRelease"),source.indexOf("export default async function"));
 assert.match(update,/if\(status==="live"\)throw new Error\("game_specific_release_authorization_required"\)/);
 assert.match(update,/requirePublishingEditor\(\)/);
});
