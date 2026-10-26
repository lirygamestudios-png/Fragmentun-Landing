import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../app/admin/master/operations/page.tsx",import.meta.url),"utf8");
test("Commander work summary highlights overdue open items",()=>{
 assert.match(source,/const overdueWork=open\.filter\(w=>typeof w\.due_date==="string"&&w\.due_date\.slice\(0,10\)<today\)/);
 assert.match(source,/\{overdueWork\.length\} vencidos/);
});
