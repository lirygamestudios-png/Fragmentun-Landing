import test from "node:test";import assert from "node:assert/strict";import {matchesEnrollmentIdentity} from "../lib/liryboost/trusted-identity-match.ts";
const id={userId:"u1",verifiedEmail:"jugador@example.com",emailVerified:true};
test("identidad y correo coincidentes",()=>assert.equal(matchesEnrollmentIdentity(id,{userId:"u1",email:"jugador@example.com"}),true));
test("identidad ajena rechazada",()=>assert.equal(matchesEnrollmentIdentity(id,{userId:"u2",email:"jugador@example.com"}),false));
test("correo no coincidente rechazado",()=>assert.equal(matchesEnrollmentIdentity(id,{userId:"u1",email:"otro@example.com"}),false));
test("correo sin verificar rechazado",()=>assert.equal(matchesEnrollmentIdentity({...id,emailVerified:false},{userId:"u1",email:"jugador@example.com"}),false));
test("no hay identidad confiable",()=>assert.equal(matchesEnrollmentIdentity(null,{userId:"u1",email:"jugador@example.com"}),false));
test("normalización de mayúsculas y espacios",()=>assert.equal(matchesEnrollmentIdentity(id,{userId:"u1",email:" JUGADOR@example.com "}),true));
