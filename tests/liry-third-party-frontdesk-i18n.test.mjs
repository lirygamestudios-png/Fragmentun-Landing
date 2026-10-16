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


test("Mi Liry identity preview accessible labels have ES and EN translations",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.miLiryIdentity,en=LIRY_FRONTDESK_STRINGS.en.miLiryIdentity;
 assert.match(es.previewAria,/sin almacenamiento/);
 assert.match(en.previewAria,/no data saved/);
 assert.match(es.exampleAvatarAria,/Avatar de ejemplo/);
 assert.match(en.exampleAvatarAria,/Example avatar/);
});


test("privacy preview modal aria labels are available in ES and EN",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.privacyPreview,en=LIRY_FRONTDESK_STRINGS.en.privacyPreview;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.match(es.closeAria,/Cerrar preferencias/);
 assert.match(en.closeAria,/Close preferences/);
 for(const key of ["sectionsAria","visibilityAria"])assert.ok(es[key]?.length>3&&en[key]?.length>3);
});


test("FrontDesk main navigation accessibility text has ES and EN parity",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.navigation,en=LIRY_FRONTDESK_STRINGS.en.navigation;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 for(const key of ["skipCatalog","navAria","searchAria","searchTitle","socialAria","socialTitle","menuAria"]){
  assert.ok(es[key]?.length>4);
  assert.ok(en[key]?.length>4);
 }
 assert.match(en.skipCatalog,/Skip to the worlds catalog/);
});


test("Journey copy and verified activity indicators have bilingual coverage",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.journey,en=LIRY_FRONTDESK_STRINGS.en.journey;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 for(const key of ["sectionAria","title","subtitle","progressAria","exploredSuffix","noActivity","discovered","visitedAria","noProgressAria","pendingNote"]){assert.ok(es[key]?.length>4&&en[key]?.length>4);}
 assert.match(en.pendingNote,/awaiting verified activity/);
});


test("achievement previews preserve public goal IDs and accurate bilingual verification wording",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.achievementsPreview,en=LIRY_FRONTDESK_STRINGS.en.achievementsPreview;
 assert.deepEqual(es.goals.map(x=>x.id),en.goals.map(x=>x.id));
 assert.equal(es.goals.length,4);
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 for(const goal of en.goals){assert.ok(goal.title.length>2&&goal.detail.length>5);}
 assert.match(en.empty,/no achievements credited/);
 assert.match(es.pendingLabel,/Pendiente/);
});


test("LiryBoost overview keeps three bilingual steps and inactive competition disclosure",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.liryBoostSection,en=LIRY_FRONTDESK_STRINGS.en.liryBoostSection;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.deepEqual(es.steps.map(x=>x.number),["01","02","03"]);
 assert.deepEqual(en.steps.map(x=>x.number),["01","02","03"]);
 assert.match(es.notice,/no genera puntos ni garantiza acceso beta/i);
 assert.match(en.notice,/earns no points and does not guarantee beta access/i);
});


test("community and social overview remain bilingual with verified-link disclaimers",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.communityOverview,en=LIRY_FRONTDESK_STRINGS.en.communityOverview;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.match(es.linksPending,/pendientes de verificación/);
 assert.match(en.linksPending,/pending verification/);
 assert.match(en.postsPending,/coming soon/);
});


test("recommendations preserve three public codenames and translated descriptions",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.recommendationsOverview,en=LIRY_FRONTDESK_STRINGS.en.recommendationsOverview;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.deepEqual(es.items.map(x=>x.code),en.items.map(x=>x.code));
 assert.deepEqual(en.items.map(x=>x.index),[4,3,5]);
 assert.equal(es.items.length,3);
 assert.match(en.viewAll,/VIEW ALL WORLDS/);
});


test("store overview preserves freemium disclosure and no active payments in ES and EN",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.storeOverview,en=LIRY_FRONTDESK_STRINGS.en.storeOverview;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.match(es.freemium,/No hay pagos activos/);
 assert.match(en.freemium,/No payments are active/);
 assert.match(en.intro,/suppliers have been confirmed/);
});


test("final FrontDesk banners have bilingual copy and no simulated secrets progress",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.finalSections,en=LIRY_FRONTDESK_STRINGS.en.finalSections;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.equal(es.signature.length,4);
 assert.equal(en.signature.length,4);
 assert.match(es.secretsNotice,/SIN PROGRESO SIMULADO/);
 assert.match(en.secretsNotice,/NO SIMULATED PROGRESS/);
 assert.match(en.journeyDisclaimer,/optional cosmetic purchases/);
});


test("footer navigation and legal center link retain matching ES EN labels",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.footerCopy,en=LIRY_FRONTDESK_STRINGS.en.footerCopy;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.equal(es.links.length,9);
 assert.equal(en.links.length,9);
 assert.equal(es.tagline.length,2);
 assert.equal(en.tagline.length,2);
 assert.match(en.rights,/All rights reserved/);
});


test("hero title, navigation descriptions and English preview notice are paired in both locales",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.heroDetails,en=LIRY_FRONTDESK_STRINGS.en.heroDetails;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.equal(es.headlineLines.length,3);
 assert.equal(en.headlineLines.length,3);
 assert.equal(es.startLines.length,2);
 assert.equal(en.startLines.length,2);
 assert.match(en.languageAria,/English translation coming soon/);
 assert.match(en.description,/Which one will be yours/);
});


test("LiryBoost Top10 translations preserve inactive and verified-only notices",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.liryBoostBoard,en=LIRY_FRONTDESK_STRINGS.en.liryBoostBoard;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.match(es.empty,/Sin participantes ni puntuaciones ficticias/);
 assert.match(en.empty,/No fictional participants or scores/);
 assert.match(en.verified,/verified invitations/);
});


test("Liry ID and developer previews remain bilingual and disabled",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es,en=LIRY_FRONTDESK_STRINGS.en;
 for(const section of ["liryIdDialog","developerDialog"])assert.deepEqual(Object.keys(es[section]).sort(),Object.keys(en[section]).sort());
 assert.deepEqual(es.liryIdDialog.modes.map(x=>x.id),en.liryIdDialog.modes.map(x=>x.id));
 assert.equal(en.liryIdDialog.modes.length,3);
 assert.match(en.liryIdDialog.inactive,/ACCESS DISABLED/);
 assert.match(en.developerDialog.inactive,/APPLICATIONS DISABLED/);
 assert.match(en.developerDialog.noData,/not requesting files, credentials/);
});


test("developer landing and Liry ID service availability remain bilingual and inactive",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es,en=LIRY_FRONTDESK_STRINGS.en;
 assert.deepEqual(Object.keys(es.developerPage).sort(),Object.keys(en.developerPage).sort());
 assert.match(en.developerPage.notice,/does not create accounts/);
 assert.match(es.developerPage.notice,/no permite crear cuentas/);
 assert.match(en.liryIdDialog.availabilityMessage,/after verification/);
 assert.match(es.liryIdDialog.availabilityMessage,/después de las verificaciones/);
});


test("developer areas keep four stable internal panel ids and bilingual inactive notices",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.developerAreas,en=LIRY_FRONTDESK_STRINGS.en.developerAreas;
 assert.deepEqual(es.areas.map(x=>x.id),["admission","listing","release","finance"]);
 assert.deepEqual(es.areas.map(x=>x.id),en.areas.map(x=>x.id));
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.match(en.notice,/no active account or data submission/);
});


test("developer admission preview stays bilingual, inoperable and retains all five requirements",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.developerAdmission,en=LIRY_FRONTDESK_STRINGS.en.developerAdmission;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.equal(es.models.length,2);assert.equal(en.models.length,2);
 assert.equal(es.requirements.length,5);assert.equal(en.requirements.length,5);
 assert.match(en.inactive,/No application submission/);
 assert.match(en.ready,/human approval/);
});


test("developer listing translations preserve inactive form states",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.developerListing,en=LIRY_FRONTDESK_STRINGS.en.developerListing;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.match(en.inactive,/No saving, file uploads, submissions or sales/);
 assert.match(en.pending,/not admission/);
});


test("developer release preview keeps five bilingual stages and prevents live uploads",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.developerRelease,en=LIRY_FRONTDESK_STRINGS.en.developerRelease;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.deepEqual(es.checkpoints.map(s=>s.id),en.checkpoints.map(s=>s.id));
 assert.equal(es.checkpoints.length,5);
 assert.match(en.inactive,/No uploads, scanning, publication/);
 assert.match(en.security,/cannot approve/);
});


test("developer finance preview preserves four categories and no fictitious transactions",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.developerFinance,en=LIRY_FRONTDESK_STRINGS.en.developerFinance;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.deepEqual(es.fields.map(f=>f.id),["sales","refunds","commission","balance"]);
 assert.deepEqual(es.fields.map(f=>f.id),en.fields.map(f=>f.id));
 assert.match(en.notice,/no transactions or balances/i);
 assert.match(en.inactive,/PAYOUTS INACTIVE/);
});

 
test("full FrontDesk dictionary maintains recursive ES EN structure and stable public IDs",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es,en=LIRY_FRONTDESK_STRINGS.en;
 function check(left,right,path){
  assert.equal(Array.isArray(left),Array.isArray(right),path+" array type");
  if(Array.isArray(left)){
   assert.equal(left.length,right.length,path+" array length");
   for(let i=0;i<left.length;i++)check(left[i],right[i],path+"["+i+"]");
   return;
  }
  if(left!==null&&typeof left==="object"){
   assert.ok(right!==null&&typeof right==="object",path+" object type");
   assert.deepEqual(Object.keys(left).sort(),Object.keys(right).sort(),path+" dictionary keys");
   for(const key of Object.keys(left)){
    if(key==="id"||key==="code"||key==="number"||key==="index")assert.equal(left[key],right[key],path+" stable identifier");
    else check(left[key],right[key],path+"."+key);
   }
   return;
  }
  assert.equal(typeof left,typeof right,path+" leaf type");
  if(typeof left==="string")assert.ok(left.trim().length>0&&right.trim().length>0,path+" nonblank translated strings");
 }
 check(es,en,"LIRY_FRONTDESK_STRINGS");
 assert.deepEqual(RELEASED_LIRY_FRONTDESK_LOCALES,["es"]);
});


test("Mi Liry landing back-link accessibility is translated and English remains gated",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.miLiry,en=LIRY_FRONTDESK_STRINGS.en.miLiry;
 assert.match(es.backAria,/Volver al FrontDesk/);
 assert.match(en.backAria,/Return to the LIRYGAMES STUDIOS FrontDesk/);
 assert.equal(liryFrontdeskStrings("en").miLiry.backAria,es.backAria);
});


test("community information placeholder has bilingual text without simulated posts",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.communityFeedIntro,en=LIRY_FRONTDESK_STRINGS.en.communityFeedIntro;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 assert.match(en.notice,/community in preparation/);
 assert.match(es.notice,/comunidad en preparación/);
});


test("community contact and official network dialogs have bilingual accessible copy",()=>{
 const es=LIRY_FRONTDESK_STRINGS.es.communityDialogs,en=LIRY_FRONTDESK_STRINGS.en.communityDialogs;
 assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
 for(const area of ["contact","networks"])assert.deepEqual(Object.keys(es[area]).sort(),Object.keys(en[area]).sort());
 assert.match(en.networks.pendingSuffix,/pending verification/);
 assert.match(en.contact.intro,/collaboration proposals/);
});
