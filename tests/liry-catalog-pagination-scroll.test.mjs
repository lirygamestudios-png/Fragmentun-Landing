import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../components/LiryGameDiscovery.tsx",import.meta.url),"utf8");
test("catalog pagination scrolls to results and respects reduced motion",()=>{assert.match(source,/const navigateCatalogPage=.*catalogResultRef\.current\?\.scrollIntoView/);assert.match(source,/prefers-reduced-motion: reduce/);assert.match(source,/behavior:reduceMotion\?"auto":"smooth"/);});

test("catalog and store result counts retain scroll space beneath header",()=>{const css=readFileSync(new URL("../app/lirygames/lirygames.module.css",import.meta.url),"utf8");assert.match(css,/\.liryCatalogCount\{[^}]*scroll-margin-top:100px/);assert.match(css,/\.liryStoreListing>p\[tabindex\]\{scroll-margin-top:100px\}/);});

test("mobile store filter reset spans both columns and remains touch accessible",()=>{const css=readFileSync(new URL("../app/lirygames/lirygames.module.css",import.meta.url),"utf8");assert.match(css,/\.liryStoreFilters button\{grid-column:1\/-1;justify-self:stretch;min-height:44px/);});

test("game dialog restores focus only to a mounted catalog trigger",()=>{assert.equal((source.match(/if\(trigger\?\.isConnected\)trigger\.focus\(\{preventScroll:true\}\)/g)||[]).length,2);});
