import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const css=readFileSync(new URL("../app/lirygames/lirygames.module.css",import.meta.url),"utf8");
test("mobile catalog titles use full row separate from share control",()=>{assert.match(css,/@media\(max-width:520px\)\{\s*\.page :global\(#mundos\) \.worldsGrid>\.gameCard>\.cardContent\{display:grid;grid-template-columns:minmax\(0,1fr\) 46px/);assert.match(css,/\.worldCardText\{grid-column:1\/-1;grid-row:1/);assert.match(css,/\.liryShareEntry\{grid-column:2;grid-row:2/);assert.match(css,/\.worldCardText h3,.*\.worldCardText p\{overflow-wrap:break-word;word-break:normal/);});

test("store mobile filters retain 44px touch targets",()=>{assert.match(css,/\.liryStoreFilters input,\.liryStoreFilters select\{width:100%;min-width:0;min-height:44px;/);});
