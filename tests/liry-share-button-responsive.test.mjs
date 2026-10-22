import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const css=readFileSync(new URL("../app/lirygames/lirygames.module.css",import.meta.url),"utf8");
const share=readFileSync(new URL("../components/LiryShareEntry.tsx",import.meta.url),"utf8");
test("product WhatsApp share dialog button wraps text without crowding",()=>{const rule=css.match(/\.liryWhatsappSend\{([^}]+)\}/)?.[1]??"";for(const declaration of ["display:flex","align-items:center","justify-content:center","width:100%","min-width:0","min-height:48px","line-height:1.45","text-align:center","white-space:normal","overflow-wrap:anywhere"])assert.ok(rule.includes(declaration),declaration);});
test("share action uses responsive button in product selection preview",()=>{assert.match(share,/className=\{styles\.liryWhatsappSend\}/);assert.match(share,/Share on WhatsApp/);});
