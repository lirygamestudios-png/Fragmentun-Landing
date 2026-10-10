import test from "node:test";import assert from "node:assert/strict";import {interpretEnrollmentInsert} from "../lib/liryboost/enrollment-transaction-contract.ts";
test("registro creado con identificador",()=>assert.equal(interpretEnrollmentInsert({kind:"created",registrationId:"r1"},"u1"),"registered"));
test("registro creado sin identificador no se confirma",()=>assert.equal(interpretEnrollmentInsert({kind:"created",registrationId:""},"u1"),"denied"));
test("duplicado propio se clasifica correctamente",()=>assert.equal(interpretEnrollmentInsert({kind:"duplicate",existingOwnerId:"u1"},"u1"),"already_registered"));
test("duplicado ajeno bloquea",()=>assert.equal(interpretEnrollmentInsert({kind:"duplicate",existingOwnerId:"u2"},"u1"),"conflict"));
test("error inesperado no permite inscripción",()=>assert.equal(interpretEnrollmentInsert({kind:"failure"},"u1"),"denied"));
test("sesión ausente impide finalizar",()=>assert.equal(interpretEnrollmentInsert({kind:"created",registrationId:"r1"},""),"denied"));
