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
 assert.equal(items[0].publicName,"Ana");
 assert.equal(items[0].verifiedInvitations,8);
});
test("limita a diez nombres públicos",()=>{
 const items=Array.from({length:20},(_,i)=>({publicName:"Jugador-"+i,verifiedInvitations:i+1}));
 assert.equal(preparePublicLiryBoostTop(items,true).length,10);
});

test("combina variantes de mayúsculas y espacios sin perder el mejor resultado",()=>{
 const rows=preparePublicLiryBoostTop([
  {publicName:" ANA ",verifiedInvitations:2},
  {publicName:"ana",verifiedInvitations:5}
 ],true);
 assert.equal(rows.length,1);
 assert.equal(rows[0].verifiedInvitations,5);
});
