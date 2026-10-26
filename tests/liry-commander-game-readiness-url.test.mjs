import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../app/admin/master/games/readiness/page.tsx",import.meta.url),"utf8");
test("game readiness parses full HTTPS play URLs instead of string prefix",()=>{
 assert.match(source,/new URL\(value\)/);
 assert.match(source,/url\.protocol==="https:"/);
 assert.match(source,/!url\.username&&!url\.password/);
 assert.match(source,/validGamePlayUrl\(item\.play_url\)/);
 assert.doesNotMatch(source,/play_url\?\.startsWith\("https:\/\/"\)/);
});
