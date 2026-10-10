import test from "node:test";
import assert from "node:assert/strict";
import {preparePublicLiryBoostTop} from "../lib/liryboost/public-leaderboard.ts";
test("concurso cerrado nunca publica clasificaciones",()=>{
 assert.deepEqual(preparePublicLiryBoostTop([{publicName:"Jugador",verifiedInvitations:3,publicListingConsented:true}],false),[]);
});
test("filtra identidades vacías, puntuaciones inválidas y repetidos",()=>{
 const items=preparePublicLiryBoostTop([
  {publicName:"",verifiedInvitations:4,publicListingConsented:true},
  {publicName:"Ana",verifiedInvitations:2,publicListingConsented:true},
  {publicName:"Ana",verifiedInvitations:8,publicListingConsented:true},
  {publicName:"Luis",verifiedInvitations:-1,publicListingConsented:true},
  {publicName:"Leo",verifiedInvitations:4,publicListingConsented:true}
 ],true);
 assert.equal(items.length,2);
 assert.equal(items[0].publicName,"Ana");
 assert.equal(items[0].verifiedInvitations,8);
});
test("limita a diez nombres públicos",()=>{
 const items=Array.from({length:20},(_,i)=>({publicName:"Jugador-"+i,verifiedInvitations:i+1,publicListingConsented:true}));
 assert.equal(preparePublicLiryBoostTop(items,true).length,10);
});

test("combina variantes de mayúsculas y espacios sin perder el mejor resultado",()=>{
 const rows=preparePublicLiryBoostTop([
  {publicName:" ANA ",verifiedInvitations:2,publicListingConsented:true},
  {publicName:"ana",verifiedInvitations:5,publicListingConsented:true}
 ],true);
 assert.equal(rows.length,1);
 assert.equal(rows[0].verifiedInvitations,5);
});

test("rechaza posibles correos y enlaces en nombres públicos",()=>{
 const rows=preparePublicLiryBoostTop([
  {publicName:"correo@dominio.com",verifiedInvitations:9,publicListingConsented:true},
  {publicName:"https://example.com",verifiedInvitations:8,publicListingConsented:true},
  {publicName:"Ana",verifiedInvitations:4,publicListingConsented:true}
 ],true);
 assert.deepEqual(rows,[{publicName:"Ana",verifiedInvitations:4}]);
});

test("sin consentimiento público no aparece en el Top 10",()=>{
 const rows=preparePublicLiryBoostTop([
  {publicName:"Privado",verifiedInvitations:100,publicListingConsented:false},
  {publicName:"Público",verifiedInvitations:2,publicListingConsented:true}
 ],true);
 assert.deepEqual(rows,[{publicName:"Público",verifiedInvitations:2}]);
});
