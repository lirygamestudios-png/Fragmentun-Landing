import test from "node:test";
import assert from "node:assert/strict";
import {preparePublicLiryBoostTop} from "../lib/liryboost/public-leaderboard.ts";
let seq=0;
const entry=(publicName,verifiedInvitations,publicListingConsented=true)=>({
 participantId:"123e4567-e89b-42d3-a456-"+String(++seq).padStart(12,"0"),
 publicName,verifiedInvitations,publicListingConsented
});
test("sin programa activo el Top 10 permanece vacío",()=>{
 assert.deepEqual(preparePublicLiryBoostTop([entry("Participante A",20)],false),[]);
});
test("solo aparecen alias con consentimiento y resultados positivos",()=>{
 const rows=preparePublicLiryBoostTop([entry("Uno",12),entry("Dos",4,false),entry("Tres",0),entry("Cuatro",-5)],true);
 assert.deepEqual(rows,[{publicName:"Uno",verifiedInvitations:12}]);
});
test("clasificación ordenada y con máximo diez participantes",()=>{
 const entries=Array.from({length:12},(_,i)=>entry("Jugador "+String(i).padStart(2,"0"),i+1));
 const rows=preparePublicLiryBoostTop(entries,true);
 assert.equal(rows.length,10);
 assert.equal(rows[0].verifiedInvitations,12);
 assert.equal(rows.at(-1).verifiedInvitations,3);
});
test("no exponer correo, enlaces ni campos privados en clasificación",()=>{
 const rows=preparePublicLiryBoostTop([
  entry("correo@ejemplo.com",50),entry("https://ejemplo.com",40),
  {...entry("Participante seguro",5),privateEmail:"privado@ejemplo.com"}
 ],true);
 assert.deepEqual(rows,[{publicName:"Participante seguro",verifiedInvitations:5}]);
});
test("un alias compartido por personas distintas no fusiona sus puntuaciones",()=>{
 const rows=preparePublicLiryBoostTop([entry("ALFA",2),entry("alfa",8),entry("BETA",3)],true);
 assert.equal(rows.length,3);
 assert.equal(rows[0].verifiedInvitations,8);
});
