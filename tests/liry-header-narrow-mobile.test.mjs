import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const css=readFileSync(new URL("../app/lirygames/lirygames.module.css",import.meta.url),"utf8");
const page=readFileSync(new URL("../app/lirygames/page.tsx",import.meta.url),"utf8");
const mobile=readFileSync(new URL("../components/LiryMobileNav.tsx",import.meta.url),"utf8");

test("narrow-screen header retains developer, player and mobile-menu access",()=>{
 assert.match(css,/@media\(max-width:420px\)\{/);
 assert.match(page,/<LiryDeveloperAccess locale=\{locale\}\s*\/>/);
 assert.match(page,/<LiryFrontdeskProfileAccess locale=\{locale\}/);
 assert.match(page,/<LiryMobileNav locale=\{locale\}/);
});
test("mobile menu exposes state and closes via Escape with focus restored",()=>{
 assert.match(mobile,/aria-expanded=\{open\}/);
 assert.match(mobile,/aria-controls="liry-mobile-nav"/);
 assert.match(mobile,/id="liry-mobile-nav"/);
 assert.match(mobile,/event\.key==="Escape"/);
 assert.match(mobile,/toggle\.current\?\.focus\(\{preventScroll:true\}\)/);
});
test("mobile menu closes when navigating or clicking outside",()=>{
 assert.match(mobile,/window\.addEventListener\("hashchange",closeOnNavigation\)/);
 assert.match(mobile,/document\.addEventListener\("pointerdown",closeOutside\)/);
 assert.match(mobile,/setOpen\(false\)/);
});

test("mobile menu links retain 44px touch targets after compact header rules",()=>{assert.match(css,/@media\(max-width:749px\)\{\.nav \.navMenuPanel a\{min-height:44px;padding:9px 8px;line-height:1\.3\}\}/);});

test("mobile menu toggle has 44px touch target",()=>{assert.match(css,/\.nav \.navMenuToggle\{width:44px;height:44px;min-width:44px;min-height:44px\}/);});
