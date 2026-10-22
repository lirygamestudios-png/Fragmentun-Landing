import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../lib/games/liry-biometric-readiness.ts",import.meta.url),"utf8");
test("biometric integration remains disabled and has no provider calls",()=>{assert.match(source,/biometricProviderStatus = "disabled"/);assert.doesNotMatch(source,/\bfetch\(|getUserMedia|service_role|process\.env|createClient\(/);});
test("biometric approval is independent from IP, bank, safety and manual review",()=>{for(const field of ["intellectualPropertyApproved","bankBeneficiaryVerified","ageAndSafetyReviewed","manualDeveloperApproval"])assert.ok(source.includes("gates."+field));assert.match(source,/gates\.identity === "verified"/);});
test("architecture documents consent, signed callbacks and privacy",()=>{for(const term of ["explicit consent","signature","replay","not ID scans","non-biometric fallback"])assert.ok(source.includes(term),term);});
