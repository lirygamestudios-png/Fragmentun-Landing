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
