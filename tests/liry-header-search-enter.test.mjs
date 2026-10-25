import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const component=readFileSync(new URL("../components/LiryHeaderUtilities.tsx",import.meta.url),"utf8");
test("header search activates first result with Enter and retains arrow navigation",()=>{assert.match(component,/e\.key==="Enter"&&results\.length>0/);assert.match(component,/firstResult\.current\?\.click\(\)/);assert.match(component,/e\.key==="ArrowDown"&&results\.length>0/);});

test("header modal only focuses mounted controls while open",()=>{assert.match(component,/if\(dialog\.current\?\.open&&target\?\.isConnected\)target\.focus\(\{preventScroll:true\}\)/);});

test("search destination is focused only when connected to document",()=>{assert.match(component,/if\(!target\?\.isConnected\)return/);assert.match(component,/target\.focus\(\{preventScroll:true\}\)/);});

test("ArrowDown focuses only a mounted search result",()=>{assert.match(component,/if\(firstResult\.current\?\.isConnected\)firstResult\.current\.focus\(\{preventScroll:true\}\)/);});
