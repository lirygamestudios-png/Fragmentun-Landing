import test from "node:test";
import assert from "node:assert/strict";
import {reviewLiryAuthRequest} from "../lib/games/liry-auth-request.ts";
test("permite registro con retorno interno",()=>assert.deepEqual(reviewLiryAuthRequest({action:"register",email:"qa@example.test",returnTo:"/lirygames/mi-liry"}),{valid:true,reason:"valid"}));
test("rechaza acción desconocida",()=>assert.equal(reviewLiryAuthRequest({action:"admin",email:"qa@example.test",returnTo:"/lirygames"}).reason,"invalid_action"));
test("rechaza correo inválido",()=>assert.equal(reviewLiryAuthRequest({action:"recover",email:"bad-address",returnTo:"/lirygames"}).reason,"invalid_email"));
test("impide redirección hacia un dominio externo",()=>assert.equal(reviewLiryAuthRequest({action:"sign_in",email:"qa@example.test",returnTo:"https://example.com"}).reason,"invalid_redirect"));
test("impide redirección al administrador",()=>assert.equal(reviewLiryAuthRequest({action:"sign_in",email:"qa@example.test",returnTo:"/admin"}).reason,"invalid_redirect"));
test("permite retorno omitido",()=>assert.equal(reviewLiryAuthRequest({action:"recover",email:"qa@example.test"}).valid,true));
