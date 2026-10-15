import test from "node:test";import assert from "node:assert/strict";
import {mayPublishDeveloperGame,publicThirdPartyCatalog,publicApprovedThirdPartyCatalog,safePublicThirdPartyCards,thirdPartyCommercialState,mayEnableThirdPartyCheckout,THIRD_PARTY_CATALOG_CAPACITY,TOTAL_CATALOG_CAPACITY,OWN_GAME_RESERVED_SLOTS} from "../lib/games/liry-developer-publication.ts";
const valid={developerId:"dev-1",gameId:"game-1",model:"freemium",state:"approved",artifactHash:"a".repeat(64),approvedArtifactHash:"a".repeat(64),ownerVerified:true,commercialRightsVerified:true,humanApproved:true};
test("100 total: 9 propios + 91 terceros",()=>{assert.equal(TOTAL_CATALOG_CAPACITY,100);assert.equal(OWN_GAME_RESERVED_SLOTS,9);assert.equal(THIRD_PARTY_CATALOG_CAPACITY,91)});
test("requires approval and matching build",()=>assert.equal(mayPublishDeveloperGame(valid),true));
test("rejects unreviewed build",()=>assert.equal(mayPublishDeveloperGame({...valid,approvedArtifactHash:"b".repeat(64)}),false));
test("rejects unapproved applicant",()=>assert.equal(mayPublishDeveloperGame({...valid,ownerVerified:false}),false));
test("rejects monetization other than premium or freemium",()=>assert.equal(mayPublishDeveloperGame({...valid,model:"subscription"}),false));
test("rejects uploaded but not approved",()=>assert.equal(mayPublishDeveloperGame({...valid,state:"uploaded_private"}),false));
test("publishes only authorized entries",()=>assert.deepEqual(publicThirdPartyCatalog([{published:true,releaseApproved:true},{published:true,releaseApproved:false}]).length,1));

const entry=(overrides={})=>({gameId:"game-1",published:true,releaseApproved:true,submission:valid,publicCard:{label:"Autorizado"},...overrides});
test("external listing requires matching approved game and build",()=>assert.deepEqual(publicApprovedThirdPartyCatalog([entry()]),[{label:"Autorizado"}]));
test("blocks an unpublished or unreviewed third-party game",()=>assert.equal(publicApprovedThirdPartyCatalog([entry({published:false}),entry({releaseApproved:false}),entry({submission:{...valid,humanApproved:false}})]).length,0));
test("blocks card bound to another game's approval",()=>assert.equal(publicApprovedThirdPartyCatalog([entry({gameId:"game-2"})]).length,0));
test("prevents duplicate game listing",()=>assert.equal(publicApprovedThirdPartyCatalog([entry(),entry()]).length,1));

const safeCard={slug:"indie-world",title:"Juego autorizado",description:"Descripción pública",model:"freemium",coverUrl:"https://example.com/cover.jpg",developerId:"secret",artifactHash:"private"};
test("projection excludes developer private data",()=>assert.deepEqual(safePublicThirdPartyCards([entry({publicCard:safeCard})]),[{slug:"indie-world",title:"Juego autorizado",description:"Descripción pública",model:"freemium",coverUrl:"https://example.com/cover.jpg"}]));
test("projection rejects invalid public slug",()=>assert.deepEqual(safePublicThirdPartyCards([entry({publicCard:{...safeCard,slug:"../private"}})]),[]));
test("projection rejects unpublished approved entry",()=>assert.deepEqual(safePublicThirdPartyCards([entry({published:false,publicCard:safeCard})]),[]));

const commercial={publicationApproved:true,published:true,commerceEnabled:true,paymentProviderReady:true,contractApproved:true,priceVerified:true};
test("commercial states distinguish preparation and approval",()=>{assert.equal(thirdPartyCommercialState({...commercial,publicationApproved:false}),"preparing");assert.equal(thirdPartyCommercialState({...commercial,published:false}),"approved_not_released")});
test("published information does not imply checkout",()=>{assert.equal(thirdPartyCommercialState({...commercial,paymentProviderReady:false}),"published_information_only");assert.equal(mayEnableThirdPartyCheckout({...commercial,priceVerified:false}),false)});
test("checkout needs all commercial authorizations",()=>assert.equal(mayEnableThirdPartyCheckout(commercial),true));

test("public model must match reviewed model",()=>assert.deepEqual(safePublicThirdPartyCards([entry({publicCard:{...safeCard,model:"premium"}})]),[]));
test("duplicate public slugs are not published twice",()=>assert.equal(safePublicThirdPartyCards([entry({publicCard:safeCard}),entry({gameId:"game-2",submission:{...valid,gameId:"game-2"},publicCard:safeCard})]).length,1));


test("cover URLs reject credentials, unsafe schemes and private hosts",()=>{
 const urls=["http://example.com/a.png","https://user:pass@example.com/a.png","https://localhost/a.png","https://127.0.0.1/a.png","https://192.168.1.2/a.png","https://example.com/a.png#fragment","https://","https://example.com/a.png ".trim()+" "];
 for(const coverUrl of urls){
  const projected=safePublicThirdPartyCards([entry({publicCard:{...safeCard,coverUrl}})]);
  assert.equal(projected[0]?.coverUrl,null,coverUrl);
 }
 assert.equal(safePublicThirdPartyCards([entry({publicCard:safeCard})])[0].coverUrl,"https://example.com/cover.jpg");
});
test("public projection enforces 91 external slots and prevents repeated games",()=>{
 const items=Array.from({length:103},(_,i)=>entry({gameId:"game-"+i,submission:{...valid,gameId:"game-"+i},publicCard:{...safeCard,slug:"game-"+i}}));
 assert.equal(safePublicThirdPartyCards(items).length,THIRD_PARTY_CATALOG_CAPACITY);
});
