import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const front=readFileSync(new URL("../app/lirygames/page.tsx",import.meta.url),"utf8");
const legal=readFileSync(new URL("../app/lirygames/legal/page.tsx",import.meta.url),"utf8");
test("FrontDesk legal entry preserves selected locale",()=>assert.match(front,/lirygames\/legal\?lang=\$\{locale\}/));
test("legal index uses locale strings and keeps it in navigation",()=>{
 assert.match(legal,/getReleasedLiryFrontdeskLocale\(\(await searchParams\)\.lang\)/);
 assert.match(legal,/liryFrontdeskStrings\(locale\)\.legalCenter/);
 assert.match(legal,/lirygames\?lang=\$\{locale\}/);
 assert.match(legal,/lirygames\/legal\/\$\{d\.slug\}\?lang=\$\{locale\}/);
});

const detail=readFileSync(new URL("../app/lirygames/legal/[slug]/page.tsx",import.meta.url),"utf8");
test("legal detail keeps locale in return navigation and distinguishes untranslated clauses",()=>{
 assert.match(detail,/getReleasedLiryFrontdeskLocale\(\(await searchParams\)\.lang\)/);
 assert.match(detail,/lirygames\/legal\?lang=\$\{locale\}/);
 assert.match(detail,/lirygames\?lang=\$\{locale\}#comunidad/);
 assert.match(detail,/draft clauses below are currently available in Spanish only/);
});

test("untranslated legal clauses are correctly marked as Spanish for screen readers",()=>{assert.match(detail,/<div lang="es">/);assert.match(detail,/<p lang="es" style=\{\{maxWidth:760/);});

test("legal contact action displays translated labels",()=>{assert.match(detail,/IR A CONTACTO →/);assert.match(detail,/GO TO CONTACT →/);});

test("legal index declares its selected document language",()=>assert.match(legal,/<main lang=\{locale\}/));

test("legal center browser title is localized",()=>{assert.match(legal,/export async function generateMetadata/);assert.match(legal,/liryFrontdeskStrings\(locale\)\.legalCenter\.title/);});

test("individual legal browser titles respect selected locale",()=>{assert.match(detail,/export async function generateMetadata/);assert.match(detail,/liryFrontdeskStrings\(locale\)\.legalCenter\.documents\.find/);assert.match(detail,/title:`\$\{title\} \| LIRYGAMES STUDIOS`/);});
