import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const component=readFileSync(new URL("../components/LiryHeaderUtilities.tsx",import.meta.url),"utf8");
test("header search activates first result with Enter and retains arrow navigation",()=>{assert.match(component,/e\.key==="Enter"&&results\.length>0/);assert.match(component,/firstResult\.current\?\.click\(\)/);assert.match(component,/e\.key==="ArrowDown"&&results\.length>0/);});
