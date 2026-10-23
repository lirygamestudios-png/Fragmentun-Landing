import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../components/LiryStoreCategories.tsx",import.meta.url),"utf8");
test("store category dialog returns focus only to an attached trigger",()=>{assert.match(source,/if\(triggerRef\.current\?\.isConnected\)triggerRef\.current\.focus\(\{preventScroll:true\}\)/);assert.match(source,/triggerRef\.current=null/);});

test("shared product link stays pending until matching product arrives",()=>{const start=source.indexOf("const deepLinkHandled=");const effectStart=source.indexOf("useEffect(()=>{",start);const effectEnd=source.indexOf("useEffect(()=>{",effectStart+1);const effect=source.slice(effectStart,effectEnd);assert.match(effect,/if\(targetIndex<0\)return;\s*deepLinkHandled\.current=true/);assert.match(effect,/if\(!selectedProduct\)\{deepLinkHandled\.current=true;return;\}/);});

test("both player and developer portals show honest disabled sign-out",()=>{for(const path of ["../app/lirygames/mi-liry/page.tsx","../app/lirygames/developer/page.tsx"]){const page=readFileSync(new URL(path,import.meta.url),"utf8");assert.match(page,/className=\{styles\.signOutPreview\}/);assert.match(page,/<button type="button" disabled aria-describedby="liry-signout-notice"/);assert.match(page,/Todavía no has iniciado sesión/);assert.match(page,/You are not signed in yet/);}});
