import test from "node:test";import assert from "node:assert/strict";
import {validateTemporaryGamerAvatar as check} from "../lib/games/liry-avatar-validation.ts";
test("acepta avatar JPEG legítimo",()=>assert.equal(check({name:"avatar.jpg",type:"image/jpeg",size:1024}).ok,true));
test("rechaza extensión incongruente",()=>assert.equal(check({name:"avatar.svg",type:"image/png",size:1024}).ok,false));
test("rechaza archivos vacíos",()=>assert.equal(check({name:"avatar.png",type:"image/png",size:0}).ok,false));
test("rechaza archivos grandes",()=>assert.equal(check({name:"avatar.webp",type:"image/webp",size:2097153}).ok,false));
test("rechaza tipos no autorizados",()=>assert.equal(check({name:"avatar.gif",type:"image/gif",size:100}).ok,false));
