import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../lib/games/liry-biometric-replay-policy.ts",import.meta.url),"utf8");
test("duplicate biometric provider events can never be accepted offline",()=>{assert.match(src,/biometricProviderStatus==="disabled"/);assert.match(src,/accepted:false/);assert.doesNotMatch(src,/accepted:true|fetch\(|getUserMedia|createClient\(/);});
test("replay blueprint lists critical safety conditions",()=>{for(const k of ["cancelled","superseded","closed","expiresAt","seenEventIds","seenProviderReferences","wrong_application","requires_durable_atomic_check"])assert.ok(src.includes(k),k);});
