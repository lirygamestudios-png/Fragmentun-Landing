import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../components/LiryGameDiscovery.tsx",import.meta.url),"utf8");
test("catalog pagination scrolls to results and respects reduced motion",()=>{assert.match(source,/const navigateCatalogPage=.*catalogResultRef\.current\?\.scrollIntoView/);assert.match(source,/prefers-reduced-motion: reduce/);assert.match(source,/behavior:reduceMotion\?"auto":"smooth"/);});
