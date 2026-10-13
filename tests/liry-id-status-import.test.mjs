import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
const here=dirname(fileURLToPath(import.meta.url));
test("LIRY ID status route resolves public contract on disk",()=>{
 const routePath=resolve(here,"../app/api/lirygames/liry-id/status/route.ts");
 const content=readFileSync(routePath,"utf8");
 const match=content.match(/from ["'](\.\.\/[^"']+liry-id-public-access)["']/);
 assert.ok(match,"expected relative import of LIRY public status");
 assert.ok(existsSync(resolve(dirname(routePath),match[1]+".ts")),"LIRY status import must resolve to a real module");
});
