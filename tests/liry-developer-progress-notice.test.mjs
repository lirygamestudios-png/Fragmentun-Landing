import test from "node:test";import assert from "node:assert/strict";
import {developerProgressNotice} from "../lib/games/liry-developer-progress-notice.ts";
test("acknowledgment is not resolution or identity approval",()=>{
 const p=developerProgressNotice("correction_required","acknowledged","es");
 assert.match(p.message,/pendiente de resolución/);
 assert.equal(p.canUnlockIdentity,false);assert.equal(p.canUnlockBank,false);assert.equal(p.canApprove,false);
});
test("document verified does not imply admission approved",()=>{
 const p=developerProgressNotice("verified","resolved","en");
 assert.match(p.message,/other checks may remain pending/);
 assert.equal(p.canApprove,false);
});
