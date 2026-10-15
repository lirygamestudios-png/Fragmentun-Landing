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
