import test from "node:test";
import assert from "node:assert/strict";
import {preparePublicLiryBoostTop} from "../lib/liryboost/public-leaderboard.ts";
test("concurso cerrado nunca publica clasificaciones",()=>{
 assert.deepEqual(preparePublicLiryBoostTop([{publicName:"Jugador",verifiedInvitations:3}],false),[]);
});
test("filtra identidades vacías, puntuaciones inválidas y repetidos",()=>{
 const items=preparePublicLiryBoostTop([
  {publicName:"",verifiedInvitations:4},
  {publicName:"Ana",verifiedInvitations:2},
  {publicName:"Ana",verifiedInvitations:8},
  {publicName:"Luis",verifiedInvitations:-1},
  {publicName:"Leo",verifiedInvitations:4}
 ],true);
 assert.equal(items.length,2);
 assert.equal(items[0].publicName,"Leo");
});
test("limita a diez nombres públicos",()=>{
 const items=Array.from({length:20},(_,i)=>({publicName:"Jugador-"+i,verifiedInvitations:i+1}));
 assert.equal(preparePublicLiryBoostTop(items,true).length,10);
});
