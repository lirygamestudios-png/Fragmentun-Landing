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

test("Mi Liry visitor copy is bilingual without suggesting active accounts",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.miLiry,en=LIRY_FRONTDESK_STRINGS.en.miLiry;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.match(es.visitorState,/SIN SESIÓN ACTIVA/);
 assert.match(en.notice,/No fictional accounts/i);
 assert.equal(liryFrontdeskStrings("en").miLiry.back,es.back);
});

test("Mi Liry six areas preserve identity and matching translations",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.miLiryAreas,en=LIRY_FRONTDESK_STRINGS.en.miLiryAreas;
 assert.equal(es.items.length,6);
 assert.deepEqual(es.items.map(item=>item.id),en.items.map(item=>item.id));
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 for(let i=0;i<6;i++)assert.deepEqual(Object.keys(es.items[i]).sort(),Object.keys(en.items[i]).sort());
 assert.match(en.items[5].detail,/not yet recording entries/i);
});

test("Mi Liry inner panels retain bilingual copy and no simulated player data",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.miLiryPanels;
 const en=LIRY_FRONTDESK_STRINGS.en.miLiryPanels;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 for(const id of Object.keys(es)){
  assert.deepEqual(Object.keys(es[id]).sort(),Object.keys(en[id]).sort());
  assert.ok(es[id].empty.length>20 && en[id].empty.length>20);
 }
 assert.match(en.liryboost.note,/does not guarantee/i);
});

test("Mi Liry identity preview and privacy text match across locales",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.miLiryIdentity;
 const en=LIRY_FRONTDESK_STRINGS.en.miLiryIdentity;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 for(const key of ["securityRules","avatars","themes"])assert.equal(es[key].length,en[key].length);
 assert.equal(es.securityRules.length,3);
 assert.match(en.previewNote,/No settings are saved/);
});
