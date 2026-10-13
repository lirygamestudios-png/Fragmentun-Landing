import test from "node:test";
import assert from "node:assert/strict";
import {buildLiryBoostHttpPayload,LIRYBOOST_PUBLIC_NO_CACHE_HEADERS} from "../lib/liryboost/http-publication.ts";
test("inactive program ignores injected rows",()=>assert.deepEqual(buildLiryBoostHttpPayload({programActive:false,leaderboard:[{publicName:"Synthetic",verifiedInvitations:5}]}),{programActive:false,leaderboard:[],message:"LiryBoost todavía no está activo."}));
test("malformed provider input fails closed",()=>assert.equal(buildLiryBoostHttpPayload({programActive:true,leaderboard:null}).programActive,false));
test("public payload strips private fields",()=>assert.deepEqual(buildLiryBoostHttpPayload({programActive:true,leaderboard:[{publicName:"QA",verifiedInvitations:2,email:"private@example.test",participantId:"secret"}]}).leaderboard,[{publicName:"QA",verifiedInvitations:2}]));
test("rejects email as public alias",()=>assert.equal(buildLiryBoostHttpPayload({programActive:true,leaderboard:[{publicName:"private@example.test",verifiedInvitations:2}]}).leaderboard.length,0));
test("public cache is disabled and robots blocked",()=>{assert.match(LIRYBOOST_PUBLIC_NO_CACHE_HEADERS["Cache-Control"],/no-store/);assert.match(LIRYBOOST_PUBLIC_NO_CACHE_HEADERS["X-Robots-Tag"],/noindex/)});
