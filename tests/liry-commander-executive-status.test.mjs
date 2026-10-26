import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../app/admin/master/page.tsx",import.meta.url),"utf8");
test("Commander does not label incomplete source data as stable",()=>{
 assert.match(source,/const sourcesIncomplete=\(liveSnapshot\.sourceWarnings\?\.length\?\?0\)>0/);
 assert.match(source,/sourcesIncomplete\?"DATOS INCOMPLETOS":"OPERACIÓN ESTABLE"/);
 assert.match(source,/\{ecosystemStatus\}/);
});
