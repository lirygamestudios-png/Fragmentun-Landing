import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const account=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");
const identity=readFileSync(new URL("../components/LiryGamerIdentity.tsx",import.meta.url),"utf8");
test("display-name preview is session-only and validated",()=>{
 assert.match(account,/sessionStorage\.setItem\(displayNamePreviewKey,name\)/);
 assert.match(account,/sessionStorage\.removeItem\(displayNamePreviewKey\)/);
 assert.match(account,/isValidLiryDisplayName\(saved\)/);
 assert.match(account,/liry:display-name-preview/);
});
test("frontdesk identity follows preview and page restore",()=>{
 assert.match(identity,/window\.addEventListener\("liry:display-name-preview",onDisplayName\)/);
 assert.match(identity,/window\.addEventListener\("pageshow",syncDisplayName\)/);
 assert.match(identity,/displayNamePreview\?\?snapshot\.displayName/);
});
