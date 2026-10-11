import test from "node:test";
import assert from "node:assert/strict";
import {buildLiryBoostPublicSnapshot} from "../lib/liryboost/public-snapshot.ts";
const participant={participantId:"123e4567-e89b-42d3-a456-426614174010",publicName:"Alias autorizado",verifiedInvitations:3,publicListingConsented:true};
test("inactivo no publica",()=>assert.deepEqual(buildLiryBoostPublicSnapshot({programActive:false,rulesPublished:true,verificationEnabled:true},[participant]),[]));
test("reglas sin publicar no publica",()=>assert.deepEqual(buildLiryBoostPublicSnapshot({programActive:true,rulesPublished:false,verificationEnabled:true},[participant]),[]));
test("verificación inactiva no publica",()=>assert.deepEqual(buildLiryBoostPublicSnapshot({programActive:true,rulesPublished:true,verificationEnabled:false},[participant]),[]));
test("no autorizado no publica",()=>assert.deepEqual(buildLiryBoostPublicSnapshot({programActive:true,rulesPublished:true,verificationEnabled:true},[{...participant,publicListingConsented:false}]),[]));
test("las tres condiciones y consentimiento permiten solo el alias y conteo",()=>assert.deepEqual(buildLiryBoostPublicSnapshot({programActive:true,rulesPublished:true,verificationEnabled:true},[participant]),[{publicName:"Alias autorizado",verifiedInvitations:3}]));
