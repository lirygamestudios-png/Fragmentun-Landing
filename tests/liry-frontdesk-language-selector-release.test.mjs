import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../lib/games/liry-frontdesk-i18n.ts",import.meta.url),"utf8");
test("both locales are released and selector labels do not claim English is pending",()=>{
 assert.match(src,/RELEASED_LIRY_FRONTDESK_LOCALES:readonly LiryFrontdeskLocale\[\]=\["es","en"\]/);
 assert.doesNotMatch(src,/English translation coming soon|traducción al inglés próximamente|translation coming soon|traducción próximamente/i);
 assert.match(src,/Language selector · English and Spanish/);
});

test("proprietary catalog preparation tagline follows ES/EN locale",()=>{const page=readFileSync(new URL("../app/lirygames/page.tsx",import.meta.url),"utf8");assert.match(page,/tagline:locale==="en"\?"LIRYGAMES experience in development":"Experiencia LIRYGAMES en preparación"/);});
