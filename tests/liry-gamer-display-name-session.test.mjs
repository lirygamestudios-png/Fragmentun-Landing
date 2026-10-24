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

test("Mi Liry header restores temporary name after page navigation",()=>{
 const header=readFileSync(new URL("../components/LiryPlayerIdentityHeader.tsx",import.meta.url),"utf8");
 assert.match(header,/sessionStorage\.getItem\("liry:temporary-display-name"\)/);
 assert.match(header,/name&&isValidLiryDisplayName\(name\)\?name:""/);
 assert.match(header,/isValidLiryDisplayName\(event\.detail\?\.name\)\?event\.detail\.name:""/);
 assert.match(header,/window\.addEventListener\("pageshow",restoreName\)/);
 assert.match(header,/window\.removeEventListener\("pageshow",restoreName\)/);
});

test("Mi Liry header restores session avatar and unregisters events",()=>{
 const header=readFileSync(new URL("../components/LiryPlayerIdentityHeader.tsx",import.meta.url),"utf8");
 assert.match(header,/sessionStorage\.getItem\("liry:temporary-avatar-thumbnail"\)/);
 assert.match(header,/window\.addEventListener\("liry:avatar-changed",restoreAvatar\)/);
 assert.match(header,/window\.removeEventListener\("liry:avatar-changed",restoreAvatar\)/);
});

test("account center refreshes temporary name when returning to Mi Liry",()=>{
 assert.match(account,/window\.addEventListener\("pageshow",restoreTemporaryName\)/);
 assert.match(account,/window\.removeEventListener\("pageshow",restoreTemporaryName\)/);
 assert.match(account,/setPublicName\(saved&&isValidLiryDisplayName\(saved\)\?saved:""\)/);
});

test("frontdesk profile applies the shared validated display-name rule",()=>{
 assert.match(identity,/import \{isValidLiryDisplayName\} from "\.\.\/lib\/games\/liry-display-name-validation"/);
 assert.match(identity,/saved&&isValidLiryDisplayName\(saved\)\?saved:null/);
 assert.match(identity,/typeof name==="string"&&isValidLiryDisplayName\(name\)\?name:null/);
});
