import test from "node:test";
import assert from "node:assert/strict";
import {authorizeLiryBoostCommand} from "../lib/liryboost/command-authorization.ts";
const actor=(role="admin")=>({authenticated:true,role,userId:"u1"});
test("administrador autorizado",async()=>assert.equal(await authorizeLiryBoostCommand(async()=>actor(),"publish_ranking"),true));
test("anónimo no autorizado",async()=>assert.equal(await authorizeLiryBoostCommand(async()=>({authenticated:false,role:"anonymous",userId:null}),"publish_ranking"),false));
test("verificador no puede publicar",async()=>assert.equal(await authorizeLiryBoostCommand(async()=>actor("verifier"),"publish_ranking"),false));
test("falla de sesión deniega acceso",async()=>assert.equal(await authorizeLiryBoostCommand(async()=>{throw Error("auth error")},"publish_ranking"),false));
test("participante no consulta otro usuario",async()=>assert.equal(await authorizeLiryBoostCommand(async()=>actor("participant"),"read_own_summary","u2"),false));
