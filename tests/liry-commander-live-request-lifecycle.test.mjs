import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const source=readFileSync(new URL("../components/MasterCommanderLive.tsx",import.meta.url),"utf8");

test("Commander live polling avoids overlapping requests",()=>{
 assert.match(source,/if\(pending\|\|!alive\)return;/);
 assert.match(source,/pending=true;/);
 assert.match(source,/finally\{\s*pending=false;/);
});

test("Commander live polling aborts pending requests on unmount",()=>{
 assert.match(source,/const controller=new AbortController\(\)/);
 assert.match(source,/cache:"no-store",signal:controller\.signal/);
 assert.match(source,/controller\.abort\(\);window\.clearInterval\(timer\)/);
 assert.match(source,/if\(alive&&!controller\.signal\.aborted\)setConnected\(false\)/);
});
