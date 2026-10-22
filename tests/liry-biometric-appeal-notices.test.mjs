import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const s=readFileSync(new URL("../lib/games/liry-biometric-appeal-notices.ts",import.meta.url),"utf8");
test("appeal messages stay offline and under human control",()=>{assert.match(s,/deliveryEnabled:false/);assert.match(s,/requiresHumanApproval:true/);assert.doesNotMatch(s,/fetch\(|sendMail\(|sendEmail\(|createClient\(/);});
test("appeal templates cover corrections, rejection, receipt and approval caveats in both languages",()=>{for(const key of ["appeal_received","request_more_information","verification_confirmed","verification_not_confirmed","es:","en:","LIRYGAMES"])assert.ok(s.includes(key),key);});
