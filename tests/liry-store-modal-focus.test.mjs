import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../components/LiryStoreCategories.tsx",import.meta.url),"utf8");
test("store category dialog returns focus only to an attached trigger",()=>{assert.match(source,/if\(triggerRef\.current\?\.isConnected\)triggerRef\.current\.focus\(\{preventScroll:true\}\)/);assert.match(source,/triggerRef\.current=null/);});
