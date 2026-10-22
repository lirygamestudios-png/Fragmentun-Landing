import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const src=readFileSync(new URL("../components/LiryGameDiscovery.tsx",import.meta.url),"utf8");

test("Liry DNA retains six-question local survey and delayed progression",()=>{
 assert.match(src,/dnaAnswers\.every\(answer=>answer!==null\)/);
 assert.match(src,/dnaStep===6/);
 assert.match(src,/setTimeout\(\(\)=>\{setDnaStep/);
 assert.match(src,/420\)/);
});
test("Liry DNA restart clears answers and returns to first question",()=>{
 assert.match(src,/clearAdvanceTimer\(\)/);
 assert.match(src,/setDnaAnswers\(Array\(6\)\.fill\(null\)\)/);
 assert.match(src,/setDnaStep\(0\)/);
});
test("Liry DNA retains public percentages and explicit explorer close",()=>{
 assert.match(src,/aria-valuenow=/);
 assert.match(src,/onClick=\{closeDnaExplorer\}/);
 assert.match(src,/publicCodenames\[i\]/);
});
