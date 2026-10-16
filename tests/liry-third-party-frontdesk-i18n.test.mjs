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

test("privacy preview translation preserves all choices without saving",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.privacyPreview;
 const en=LIRY_FRONTDESK_STRINGS.en.privacyPreview;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 for(const field of ["visibilityLabels","visibilityStates"])assert.equal(es[field].length,en[field].length);
 assert.match(en.unsaved,/Not saved/);
});

test("Secretos de Liry conserva advertencias equivalentes en ES y EN",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.secrets;
 const en=LIRY_FRONTDESK_STRINGS.en.secrets;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.match(en.empty,/no rewards to claim/i);
 assert.match(es.empty,/no hay fragmentos disponibles/i);
});

test("gamer information dialogs preserve five topics and four illustrative goals",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.gamerInfo,en=LIRY_FRONTDESK_STRINGS.en.gamerInfo;
 assert.deepEqual(Object.keys(es.panels).sort(),Object.keys(en.panels).sort());
 assert.equal(es.goals.length,4);assert.equal(en.goals.length,4);
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.match(en.panels.logros.notice,/no medals, rewards/i);
});

test("gamer identity stages have matching locale keys and disabled-account warnings",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.identityStages;
 const en=LIRY_FRONTDESK_STRINGS.en.identityStages;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.match(es.unavailable,/NO DISPONIBLE/);
 assert.match(en.unavailable,/NOT AVAILABLE/);
});

test("Mi Liry facts preserve five sections and three status rows without invented achievements",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.miLiryFacts,en=LIRY_FRONTDESK_STRINGS.en.miLiryFacts;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 for(const id of Object.keys(es)){assert.equal(es[id].length,3);assert.equal(en[id].length,3);}
 assert.match(en.liryboost[1][1],/No active leaderboard/);
});

test("Legal center preserves eight canonical slugs and prelaunch disclaimers in both locales",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.legalCenter,en=LIRY_FRONTDESK_STRINGS.en.legalCenter;
 assert.deepEqual(es.documents.map(item=>item[0]),en.documents.map(item=>item[0]));
 assert.equal(es.documents.length,8);
 assert.match(es.intro,/No constituyen políticas definitivas/i);
 assert.match(en.intro,/not final policies/i);
});

test("legal document routes are stable and labels available without changing clause substance",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.legalCenter,en=LIRY_FRONTDESK_STRINGS.en.legalCenter;
 const expected=["privacidad","terminos","cookies","compras","liryboost","propiedad-intelectual","menores","accesibilidad"];
 assert.deepEqual(es.documents.map(item=>item[0]),expected);
 assert.deepEqual(en.documents.map(item=>item[0]),expected);
 assert.match(es.draft,/PREPARACIÓN/);
});

test("contact subjects preserve backend values and consent meaning in ES and EN",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.contact,en=LIRY_FRONTDESK_STRINGS.en.contact;
 assert.equal(es.subjectOptions.length,5);
 assert.equal(en.subjectOptions.length,5);
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.match(es.consentText,/No implica suscripción/);
 assert.match(en.consentText,/does not subscribe/i);
});

test("share controls offer matched translations without claiming verified publication",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.shareCopy,en=LIRY_FRONTDESK_STRINGS.en.shareCopy;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.match(en.socialNotice,/Posting depends on the social network/);
 assert.match(es.socialNotice,/publicación depende de la red social/);
});

test("DNA detail texts remain paired with six styles and preserve advisory warnings",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.dnaDetails,en=LIRY_FRONTDESK_STRINGS.en.dnaDetails;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.equal(es.descriptions.length,6);
 assert.equal(en.descriptions.length,6);
 assert.match(en.recommendationNote,/not psychological assessments/i);
});

test("gamer profile avatar and XP labels match across languages",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.gamerProfileDetails,en=LIRY_FRONTDESK_STRINGS.en.gamerProfileDetails;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.match(es.avatarHelp,/No se sube al servidor/i);
 assert.match(en.avatarHelp,/not uploaded to the server/i);
 assert.match(es.xpTowardNextLevel,/hacia el siguiente nivel/);
 assert.match(en.xpTowardNextLevel,/toward the next level/);
 assert.equal(es.xpTotal,"Total");
 assert.equal(en.xpTotal,"Total");
 assert.match(es.avatarValidationError,/hasta 2 MB/);
 assert.match(en.avatarValidationError,/up to 2 MB/);
});


test("Mi Liry area dialog accessibility labels are paired in ES and EN",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.miLiryAreas,en=LIRY_FRONTDESK_STRINGS.en.miLiryAreas;
 for(const key of ["openAria","closeAria","identityAria","securityAria","worldsAria","achievementsAria","inventoryAria","communityAria","boostAria"]){
  assert.ok(es[key]?.length>3);
  assert.ok(en[key]?.length>3);
 }
 assert.match(en.closeAria,/return to MI LIRY/);
});
