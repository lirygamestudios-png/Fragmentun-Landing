import test from "node:test";
import assert from "node:assert/strict";
import {getReleasedLiryFrontdeskLocale,liryFrontdeskStrings,LIRY_FRONTDESK_STRINGS,RELEASED_LIRY_FRONTDESK_LOCALES} from "../lib/games/liry-frontdesk-i18n.ts";
test("visitor language stays Spanish until English passes full release",()=>{
 assert.deepEqual(RELEASED_LIRY_FRONTDESK_LOCALES,["es"]);
 for(const value of ["en","fr",null,undefined,{},["en"]])assert.equal(getReleasedLiryFrontdeskLocale(value),"es");
});
test("prepared English strings remain separate from released Spanish",()=>{
 assert.equal(liryFrontdeskStrings("en").navigation.home,"Inicio");
 assert.equal(LIRY_FRONTDESK_STRINGS.en.navigation.home,"Home");
 assert.equal(LIRY_FRONTDESK_STRINGS.es.hero.headline,"CIENTOS DE MUNDOS. INFINITAS FORMAS DE JUGAR.");
});

test("catalog and journey translations retain matched key coverage",()=>{
 for(const section of ["navigation","hero","discovery","journey","visitor","catalog"]){
  assert.deepEqual(Object.keys(LIRY_FRONTDESK_STRINGS.en[section]).sort(),Object.keys(LIRY_FRONTDESK_STRINGS.es[section]).sort());
 }
 assert.match(LIRY_FRONTDESK_STRINGS.en.discovery.description,/not games available to play/i);
});

test("DNA questions, choices and styles have consistent bilingual coverage",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.gamerDna;
 const en=LIRY_FRONTDESK_STRINGS.en.gamerDna;
 for(const field of ["traits","questions","answers"])assert.equal(es[field].length,en[field].length);
 assert.equal(es.questions.length,6);
 assert.equal(en.traits.length,6);
});
test("gamer profile and community tab translations have matching structures",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es,en=LIRY_FRONTDESK_STRINGS.en;
 assert.deepEqual(Object.keys(es.gamerProfile).sort(),Object.keys(en.gamerProfile).sort());
 assert.deepEqual(Object.keys(es.communityTabs).sort(),Object.keys(en.communityTabs).sort());
 for(const category of Object.keys(es.communityTabs)){
  assert.deepEqual(Object.keys(es.communityTabs[category]).sort(),Object.keys(en.communityTabs[category]).sort());
 }
 assert.match(en.communityTabs.all.copy,/No fictional conversations/i);
});

test("LiryBoost, store, networks and contact keys match both languages",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es,en=LIRY_FRONTDESK_STRINGS.en;
 for(const section of ["liryBoost","social","contact"]){
  assert.deepEqual(Object.keys(es[section]).sort(),Object.keys(en[section]).sort());
 }
 assert.deepEqual(Object.keys(es.store).sort(),Object.keys(en.store).sort());
 assert.deepEqual(es.store.categories.map(c=>c.id),en.store.categories.map(c=>c.id));
 assert.equal(es.store.categories.length,5);
 assert.match(en.liryBoost.preview,/registrations are not being accepted yet/i);
 assert.match(en.store.unavailable,/No active products or payments/i);
});
