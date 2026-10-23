import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../components/LiryStoreCategories.tsx",import.meta.url),"utf8");
test("store category dialog returns focus only to an attached trigger",()=>{assert.match(source,/if\(triggerRef\.current\?\.isConnected\)triggerRef\.current\.focus\(\{preventScroll:true\}\)/);assert.match(source,/triggerRef\.current=null/);});

test("shared product link stays pending until matching product arrives",()=>{const start=source.indexOf("const deepLinkHandled=");const end=source.indexOf("useEffect(()=>{",start+20);const effect=source.slice(start,end);assert.match(effect,/if\(targetIndex<0\)return;\s*deepLinkHandled\.current=true/);assert.match(effect,/if\(!selectedProduct\)\{deepLinkHandled\.current=true;return;\}/);});
