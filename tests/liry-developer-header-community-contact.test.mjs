import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const page=readFileSync(new URL("../app/lirygames/page.tsx",import.meta.url),"utf8");
const dialog=readFileSync(new URL("../components/LiryCommunityContact.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../app/lirygames/lirygames.module.css",import.meta.url),"utf8");
test("developer entry is located in header, not gamer profile",()=>{const header=page.slice(page.indexOf('<header className={styles.nav}>'),page.indexOf('</header>',page.indexOf('<header className={styles.nav}>')));assert.match(header,/<LiryDeveloperAccess \/>/);assert.equal((page.match(/<LiryDeveloperAccess \/>/g)||[]).length,1)});
test("contact is a community modal, not another long section",()=>{assert.match(page,/<LiryCommunityContact \/>/);assert.doesNotMatch(page,/id="contacto"/);assert.match(dialog,/<LiryContactForm \/>/)});
test("approved buttons fit mobile header",()=>{assert.match(css,/\.nav \.developerNavAccess\{/);assert.match(css,/@media\(max-width:750px\)\{\.nav \.developerNavAccess/);assert.match(css,/\.communityContactAction:hover/)});
