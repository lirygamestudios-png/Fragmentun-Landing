import test from "node:test";
import assert from "node:assert/strict";
import {preparePublicLiryBoostTop} from "../lib/liryboost/public-leaderboard.ts";
const id=n=>"123e4567-e89b-42d3-a456-"+String(n).padStart(12,"0");
const entry=(n,name,count,consent=true)=>({participantId:id(n),publicName:name,verifiedInvitations:count,publicListingConsented:consent});

test("concurso cerrado no publica clasificaciones",()=>{
 assert.deepEqual(preparePublicLiryBoostTop([entry(1,"Jugador",3)],false),[]);
});
test("filtra filas inválidas y deduplica por participante",()=>{
 const rows=preparePublicLiryBoostTop([
  entry(1,"",4),entry(2,"Ana",2),entry(2,"Ana",8),entry(3,"Luis",-1),entry(4,"Leo",4)
 ],true);
 assert.equal(rows.length,2);
 assert.deepEqual(rows[0],{publicName:"Ana",verifiedInvitations:8});
});
test("limita los resultados públicos a diez",()=>{
 const entries=Array.from({length:20},(_,i)=>entry(i+1,"Jugador-"+i,i+1));
 assert.equal(preparePublicLiryBoostTop(entries,true).length,10);
});
test("personas distintas con el mismo alias conservan posiciones distintas",()=>{
 const rows=preparePublicLiryBoostTop([entry(1,"ANA",2),entry(2,"ANA",5)],true);
 assert.equal(rows.length,2);
 assert.equal(rows[0].verifiedInvitations,5);
});
test("no divulga UUID privados en el resultado",()=>{
 const rows=preparePublicLiryBoostTop([entry(1,"Ana",2)],true);
 assert.deepEqual(rows,[{publicName:"Ana",verifiedInvitations:2}]);
});
test("rechaza correos, URLs y ausencia de consentimiento",()=>{
 const rows=preparePublicLiryBoostTop([
  entry(1,"correo@dominio.com",9),entry(2,"https://example.com",8),
  entry(3,"Privado",100,false),entry(4,"Público",2)
 ],true);
 assert.deepEqual(rows,[{publicName:"Público",verifiedInvitations:2}]);
});
test("descarta identificadores inválidos",()=>{
 const rows=preparePublicLiryBoostTop([{...entry(1,"Ana",3),participantId:"no-id"}],true);
 assert.deepEqual(rows,[]);
});
