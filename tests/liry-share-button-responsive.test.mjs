import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const css=readFileSync(new URL("../app/lirygames/lirygames.module.css",import.meta.url),"utf8");
const share=readFileSync(new URL("../components/LiryShareEntry.tsx",import.meta.url),"utf8");
test("product WhatsApp share dialog button wraps text without crowding",()=>{const rule=css.match(/\.liryWhatsappSend\{([^}]+)\}/)?.[1]??"";for(const declaration of ["display:flex","align-items:center","justify-content:center","width:100%","min-width:0","min-height:48px","line-height:1.45","text-align:center","white-space:normal","overflow-wrap:anywhere"])assert.ok(rule.includes(declaration),declaration);});
test("share action uses responsive button in product selection preview",()=>{assert.match(share,/className=\{styles\.liryWhatsappSend\}/);assert.match(share,/Share on WhatsApp/);});

test("share preview frame expands on desktop and mobile",()=>{assert.match(css,/\.liryWhatsappDialog\{width:min\(96vw,620px\)/);assert.match(css,/@media\(max-width:480px\)\{\.liryWhatsappDialog\{width:calc\(100vw - 16px\)/);assert.match(css,/\.liryWhatsappSend\{min-height:52px;padding:12px 10px;font-size:15px/);});

test("share icon sizing cannot apply to buttons inside modal",()=>{assert.doesNotMatch(css,/\.liryShareEntry button\{display:inline-grid;place-items:center;flex:0 0 34px/);assert.match(css,/\.liryShareEntry>button\{display:inline-grid;place-items:center;flex:0 0 34px/);});

test("mobile product cards have an ordered vertical layout without changing the share modal",()=>{assert.match(css,/@media\(max-width:560px\)\{\.liryStoreProducts\{[^}]*align-items:stretch/);assert.match(css,/\.liryStoreProduct\{display:flex;flex-direction:column;align-items:stretch;gap:10px/);assert.match(css,/\.liryStoreProduct h4\{margin:0;line-height:1\.4;min-height:2\.8em/);assert.match(css,/\.liryStoreProduct>\.liryShareEntry\{align-self:flex-start;margin:0/);});

test("WhatsApp share dialog only restores focus to mounted product icon",()=>{assert.match(share,/if\(opener\.current\?\.isConnected\)opener\.current\.focus/);assert.match(share,/opener\.current=null/);});

test("social share preview restores focus only to a mounted trigger",()=>{const s=readFileSync(new URL("../components/LiryShare.tsx",import.meta.url),"utf8");assert.match(s,/if\(previewTrigger\.current\?\.isConnected\)previewTrigger\.current\.focus\(\{preventScroll:true\}\)/);assert.match(s,/previewTrigger\.current=null/);});
