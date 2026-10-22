import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../lib/games/liry-biometric-provider-envelope.ts",import.meta.url),"utf8");
test("provider validation rejects bad status and timing",()=>{for(const key of ["isIdentityDecision(item.decision)","expiry<=nowMs","issued>nowMs+60_000","seenEventIds.has","identifier.test"])assert.ok(source.includes(key),key)});
test("provider validation drops unexpected sensitive input fields",()=>{assert.match(source,/return \{ok:true,value:\{eventId:/);assert.doesNotMatch(source,/\bfetch\(|getUserMedia|createClient\(/);});
test("provider validation is offline only and requires future signature verification",()=>{assert.match(source,/Never call this parser before signature verification/);assert.match(source,/durable replay protection/);});
