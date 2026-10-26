import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../app/admin/master/operations/page.tsx",import.meta.url),"utf8");
test("Commander work summary highlights overdue open items",()=>{
 assert.match(source,/const overdueWork=open\.filter\(w=>typeof w\.due_date==="string"&&w\.due_date\.slice\(0,10\)<today\)/);
 assert.match(source,/\{overdueWork\.length\} vencidos/);
});

test("critical operations exclude completed and canceled work",()=>{
 assert.match(source,/const blocked=open\.filter\(w=>w\.status==="blocked"\|\|w\.priority==="critical"\)/);
});

test("proposed decisions show overdue reviews using existing Commander summary",()=>{
 assert.match(source,/const overdueDecisions=pendingDecisions\.filter\(d=>typeof d\.review_date==="string"&&d\.review_date\.slice\(0,10\)<today\)/);
 assert.match(source,/\{overdueDecisions\.length\} revisiones vencidas/);
});

test("Commander summary shows open work without an assigned owner",()=>{
 assert.match(source,/const unassignedWork=open\.filter\(w=>!w\.owner_user_id\)/);
 assert.match(source,/\{unassignedWork\.length\} sin responsable/);
});
