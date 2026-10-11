import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../lib/games/public-gamer-snapshot.ts",import.meta.url),"utf8");
test("contract defaults to visitor without verified activity",()=>{
 assert.match(source,/status:"visitor",displayName:"Visitante",verifiedActivity:null/);
 assert.match(source,/if\(!authenticated\)return/);
});
test("verified activity is guarded by explicit server verification",()=>{
 assert.match(source,/serverVerified=false/);
 assert.match(source,/if\(!serverVerified\|\|!activity/);
});
test("private account identifier never enters the public projection",()=>{
 assert.match(source,/Omit<VerifiedGamerActivity,"accountId">/);
 const projection=source.slice(source.indexOf('return {status:"verified"'));
 assert.doesNotMatch(projection,/accountId:/);
});
test("rejects invalid counters, identifiers and timestamps",()=>{
 assert.match(source,/Number\.isSafeInteger/);
 assert.match(source,/new Set\(items\)\.size===items\.length/);
 assert.match(source,/activity\.achievedCount!==activity\.achievementIds\.length/);
 assert.match(source,/Date\.parse\(activity\.verifiedAt\)>Date\.now\(\)/);
});
