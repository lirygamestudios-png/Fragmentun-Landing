import test from "node:test";import assert from "node:assert/strict";
import {validateTemporaryGamerAvatarContent as validate} from "../lib/games/liry-avatar-validation.ts";
const mock=(type,bytes)=>({type,slice:()=>({arrayBuffer:async()=>Uint8Array.from(bytes).buffer})});
test("PNG válido",async()=>assert.equal(await validate(mock("image/png",[137,80,78,71,13,10,26,10])),true));
test("JPEG válido",async()=>assert.equal(await validate(mock("image/jpeg",[255,216,255])),true));
test("WebP válido",async()=>assert.equal(await validate(mock("image/webp",[82,73,70,70,0,0,0,0,87,69,66,80])),true));
test("rechaza formato PNG fingido",async()=>assert.equal(await validate(mock("image/png",[60,115,118,103])),false));
test("rechaza archivo inaccesible",async()=>assert.equal(await validate({type:"image/png",slice:()=>{throw Error("offline")}}),false));
