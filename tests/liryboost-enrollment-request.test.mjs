import test from "node:test";
import assert from "node:assert/strict";
import {reviewLiryBoostEnrollmentRequest} from "../lib/liryboost/enrollment-request.ts";
const good={participantId:"123e4567-e89b-42d3-a456-426614174000",publicAlias:"Gamer",acceptedRulesVersion:"v1",expectedRulesVersion:"v1",consentConfirmed:true};
test("solo valida una solicitud, no crea inscripción",()=>{
 assert.deepEqual(reviewLiryBoostEnrollmentRequest(good),{accepted:true,reason:"request_valid_only"});
});
test("requiere identificador de participante válido",()=>{
 assert.equal(reviewLiryBoostEnrollmentRequest({...good,participantId:"inventado"}).reason,"invalid_participant");
});
test("rechaza alias inválidos y posibles datos privados",()=>{
 for(const publicAlias of ["","correo@example.com","https://sitio.com","<script>","a".repeat(61)])
  assert.equal(reviewLiryBoostEnrollmentRequest({...good,publicAlias}).reason,"invalid_alias");
});
test("exige aceptar la misma versión de reglas",()=>{
 assert.equal(reviewLiryBoostEnrollmentRequest({...good,acceptedRulesVersion:"v0"}).reason,"invalid_rules");
});
test("exige consentimiento booleano explícito",()=>{
 assert.equal(reviewLiryBoostEnrollmentRequest({...good,consentConfirmed:"true"}).reason,"missing_consent");
});
