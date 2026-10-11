import test from "node:test";
import assert from "node:assert/strict";
import {readLiryBoostTop10} from "../lib/liryboost/read-provider.ts";
test("LiryBoost sin proveedor publica clasificación vacía",async()=>{
 assert.deepEqual(await readLiryBoostTop10(null),{programActive:false,leaderboard:[]});
});
test("LiryBoost no consulta participantes si las bases no se publicaron",async()=>{
 let called=false;
 const result=await readLiryBoostTop10({
  readPublicationState:async()=>({programActive:true,rulesPublished:false,verificationEnabled:true}),
  readAuthorizedVerifiedEntries:async()=>{called=true;return [];}
 });
 assert.deepEqual(result,{programActive:false,leaderboard:[]});
 assert.equal(called,false);
});
test("fallos del proveedor nunca exponen resultados ni activan concurso",async()=>{
 const result=await readLiryBoostTop10({
  readPublicationState:async()=>{throw new Error("offline");},
  readAuthorizedVerifiedEntries:async()=>{throw new Error("no-access");}
 });
 assert.deepEqual(result,{programActive:false,leaderboard:[]});
});
test("proveedor que devuelve filas malformadas mantiene bloqueo",async()=>{
 const result=await readLiryBoostTop10({
  readPublicationState:async()=>({programActive:true,rulesPublished:true,verificationEnabled:true}),
  readAuthorizedVerifiedEntries:async()=>null
 });
 assert.deepEqual(result,{programActive:false,leaderboard:[]});
});
