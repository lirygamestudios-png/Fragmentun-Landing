import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

test("MailerLite group IDs remain exact JSON strings",()=>{
 const source=readFileSync(new URL("../app/api/subscribe/route.ts",import.meta.url),"utf8");
 assert.ok(source.includes('"groups":[${JSON.stringify(groupId)}]'));
 const id="200513144673534994";
 const serialized=JSON.stringify({groups:[id]});
 assert.equal(JSON.parse(serialized).groups[0],id);
 assert.notEqual(String(Number(id)),id);
});

test("MailerLite requires verified email and capture-group membership",()=>{
 const source=readFileSync(new URL("../app/api/subscribe/route.ts",import.meta.url),"utf8");
 assert.match(source,/encodeURIComponent\(email\)/);
 assert.ok(source.includes('verifiedEmail===email && /^\\d+$/.test(verifiedId) && inTargetGroup'));
 assert.match(source,/mailerliteStatus!=="synced"/);
});

test("Missing MailerLite configuration never grants signup success",()=>{
 const source=readFileSync(new URL("../app/api/subscribe/route.ts",import.meta.url),"utf8");
 assert.match(source,/if\(!token \|\| !configuredGroup\)/);
 assert.match(source,/MailerLite configuration missing/);
 assert.match(source,/if\(mailerliteStatus!=="synced"\)/);
});

test("Capture groups are never created or guessed on mismatched configured IDs",()=>{
 const source=readFileSync(new URL("../app/api/subscribe/route.ts",import.meta.url),"utf8");
 assert.match(source,/configured group ID not found; refusing fallback/);
 assert.match(source,/automatic creation disabled/);
});
