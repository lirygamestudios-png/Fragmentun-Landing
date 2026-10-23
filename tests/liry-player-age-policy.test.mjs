import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../lib/games/liry-player-age-policy.ts",import.meta.url),"utf8");
test("Liry age policy handles exact age boundaries and invalid dates without storing personal data",()=>{
 assert.match(source,/age<13/);
 assert.match(source,/age<18/);
 assert.match(source,/bornUTC>nowUTC/);
 assert.match(source,/age>125/);
 assert.match(source,/getUTCDate\(\)===day/);
 assert.match(source,/parental-consent/);
 assert.doesNotMatch(source,/localStorage|sessionStorage|fetch\(|supabase|setCookie/);
});
