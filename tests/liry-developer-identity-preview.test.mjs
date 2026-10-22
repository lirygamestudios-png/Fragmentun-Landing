import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const preview=readFileSync(new URL("../components/LiryDeveloperIdentityPreview.tsx",import.meta.url),"utf8");
const admission=readFileSync(new URL("../components/LiryDeveloperAdmissionPreview.tsx",import.meta.url),"utf8");
test("admission includes localized identity preview, not an actual capture flow",()=>{
 assert.match(admission,/<LiryDeveloperIdentityPreview locale=\{locale\}/);
 assert.match(preview,/locale==="es"/);
 assert.match(preview,/Informational preview only/);
});
test("identity preview cannot capture documents, selfies or biometric identifiers",()=>{
 assert.doesNotMatch(preview,/getUserMedia|capture=|type="file"|fetch\(|FileReader|localStorage|sessionStorage|indexedDB|navigator\.mediaDevices/);
});
test("identity verification and developer admission remain separate decisions",()=>{
 assert.match(preview,/Identity verification does not establish IP rights/);
 assert.match(preview,/human review or alternative method/);
 assert.match(preview,/retention and deletion/);
 assert.match(preview,/aria-expanded=\{details\}/);
});
