import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../components/LiryDeveloperIdentityPreview.tsx",import.meta.url),"utf8");
test("biometric process remains informational and blocked",()=>{assert.match(source,/Integration status: BLOCKED/);assert.match(source,/Estado de integración: BLOQUEADO/);assert.doesNotMatch(source,/getUserMedia|capture=|<input type="file"|fetch\(|navigator\.mediaDevices|localStorage|sessionStorage/);});
test("biometric safeguards include human review, alternatives and limited data",()=>{for(const term of ["consentimiento","Alternativa no biométrica","revisión humana","retención","firma","expiración","proveedor"])assert.ok(source.toLowerCase().includes(term.toLowerCase()),term);});
