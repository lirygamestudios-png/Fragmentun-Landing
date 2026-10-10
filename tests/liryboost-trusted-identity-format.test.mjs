import test from "node:test";import assert from "node:assert/strict";import {matchesEnrollmentIdentity} from "../lib/liryboost/trusted-identity-match.ts";
const identity={userId:"u1",verifiedEmail:"jugador@example.com",emailVerified:true};
test("usuario confiable no admite espacios en su identificador",()=>assert.equal(matchesEnrollmentIdentity({...identity,userId:" u1"},{userId:" u1",email:"jugador@example.com"}),false));
test("identificador suministrado con espacios se rechaza",()=>assert.equal(matchesEnrollmentIdentity(identity,{userId:"u1 ",email:"jugador@example.com"}),false));
test("coincidencia válida permanece autorizada",()=>assert.equal(matchesEnrollmentIdentity(identity,{userId:"u1",email:"jugador@example.com"}),true));
