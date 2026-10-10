import test from "node:test";
import assert from "node:assert/strict";
import {readLiryBoostTop10} from "../lib/liryboost/read-provider.ts";
const open={programActive:true,rulesPublished:true,verificationEnabled:true};
const entry={publicName:"Nombre consentido",verifiedInvitations:5,publicListingConsented:true};
test("sin proveedor no hay listado",async()=>assert.deepEqual(await readLiryBoostTop10(null),{programActive:false,leaderboard:[]}));
test("sin reglas no accede a participantes",async()=>{
 let touched=false;
 const result=await readLiryBoostTop10({readPublicationState:async()=>({...open,rulesPublished:false}),readAuthorizedVerifiedEntries:async()=>{touched=true;return [entry]}});
 assert.equal(touched,false);assert.deepEqual(result,{programActive:false,leaderboard:[]});
});
test("error del proveedor cierra sin datos",async()=>assert.deepEqual(await readLiryBoostTop10({readPublicationState:async()=>{throw Error("connection failed")},readAuthorizedVerifiedEntries:async()=>[entry]}),{programActive:false,leaderboard:[]}));
test("proveedor autorizado entrega alias y conteo",async()=>assert.deepEqual(await readLiryBoostTop10({readPublicationState:async()=>open,readAuthorizedVerifiedEntries:async()=>[entry]}),{programActive:true,leaderboard:[{publicName:"Nombre consentido",verifiedInvitations:5}]}));
