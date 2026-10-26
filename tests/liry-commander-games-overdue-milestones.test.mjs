import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../app/admin/master/games/page.tsx",import.meta.url),"utf8");
test("Commander games flags overdue milestones that remain open",()=>{
 assert.match(source,/const overdueMilestones=activeMilestones\.filter\(m=>typeof m\.target_date==="string"&&m\.target_date\.slice\(0,10\)<milestoneToday\)/);
 assert.match(source,/\{overdueMilestones\.length\} etapas vencidas/);
});

test("Commander counts active milestones without an owner",()=>{
 assert.match(source,/const unassignedMilestones=activeMilestones\.filter\(m=>!m\.owner_user_id\)/);
 assert.match(source,/\{unassignedMilestones\.length\} sin responsable/);
});
