import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const front=readFileSync(new URL("../app/lirygames/page.tsx",import.meta.url),"utf8");
const legal=readFileSync(new URL("../app/lirygames/legal/page.tsx",import.meta.url),"utf8");
test("FrontDesk legal entry preserves selected locale",()=>assert.match(front,/lirygames\/legal\?lang=\$\{locale\}/));
test("legal index uses locale strings and keeps it in navigation",()=>{
 assert.match(legal,/getReleasedLiryFrontdeskLocale\(\(await searchParams\)\.lang\)/);
 assert.match(legal,/liryFrontdeskStrings\(locale\)\.legalCenter/);
 assert.match(legal,/lirygames\?lang=\$\{locale\}/);
 assert.match(legal,/lirygames\/legal\/\$\{d\.slug\}\?lang=\$\{locale\}/);
});
