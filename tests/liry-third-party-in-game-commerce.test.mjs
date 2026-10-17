import test from "node:test";
import assert from "node:assert/strict";
import {LIRY_COMMERCE_CHANNELS,LIRY_IN_GAME_COMMERCE_RELEASE,LIRY_IN_GAME_PURCHASE_CATEGORIES,canOpenLiryInGameCheckout,canFulfillLiryInGamePurchase,isValidLiryInGamePurchaseCategory} from "../lib/games/liry-in-game-commerce-contract.ts";

test("in-game commerce is distinct from FrontDesk merchandising and cannot charge",()=>{
 assert.notEqual(LIRY_COMMERCE_CHANNELS.frontdesk,LIRY_COMMERCE_CHANNELS.inGame);
 assert.equal(LIRY_IN_GAME_COMMERCE_RELEASE.availability,"not_launched");
 assert.equal(LIRY_IN_GAME_COMMERCE_RELEASE.checkoutEnabled,false);
 assert.equal(LIRY_IN_GAME_COMMERCE_RELEASE.fulfillmentEnabled,false);
 assert.equal(LIRY_IN_GAME_COMMERCE_RELEASE.liveItems.length,0);
 assert.equal(LIRY_IN_GAME_COMMERCE_RELEASE.linkedGames.length,9);
});
test("skins, weapons and tools can be modeled without enabling transactions",()=>{
 for(const category of ["skin","weapon","tool","cosmetic","expansion"]){
  assert.ok(LIRY_IN_GAME_PURCHASE_CATEGORIES.includes(category));
  assert.equal(isValidLiryInGamePurchaseCategory(category),true);
 }
 assert.equal(isValidLiryInGamePurchaseCategory("invalid"),false);
});
test("checkout never opens before verified game and payment readiness",()=>{
 const ready={catalogApproved:true,playerAuthenticated:true,gameServerVerified:true,paymentsEnabled:true,fulfillmentVerified:true};
 const item={id:"sample",publicGameCode:LIRY_IN_GAME_COMMERCE_RELEASE.linkedGames[0],category:"skin",entitlementCode:"sample",ownership:"account_bound",grantsCompetitiveAdvantage:false,published:true,priceMinorUnits:100,currency:"USD"};
 assert.equal(canOpenLiryInGameCheckout(ready,item),false);
});
test("client cannot grant digital purchases while fulfillment is locked",()=>{
 const sample={purchaseId:"p",gamerId:"g",itemId:"i",publicGameCode:LIRY_IN_GAME_COMMERCE_RELEASE.linkedGames[0],paymentStatus:"confirmed",deliveryStatus:"pending",providerReference:"verified",idempotencyKey:"unique"};
 assert.equal(canFulfillLiryInGamePurchase(sample),false);
});
