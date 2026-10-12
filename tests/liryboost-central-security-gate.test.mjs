import test from "node:test";
import assert from "node:assert/strict";
import {reviewLiryBoostCentralSecurity} from "../lib/liryboost/central-security-gate.ts";
const verified={source:"central_database",available:true,allowed:true,confirmed:true};
test("permite exclusivamente verificación central confirmada",()=>assert.deepEqual(reviewLiryBoostCentralSecurity(verified),{permitted:true,reason:"central_verified"}));
test("rechaza caída de servicio central",()=>assert.deepEqual(reviewLiryBoostCentralSecurity({...verified,available:false}),{permitted:false,reason:"central_unavailable"}));
test("rechaza fallback local como prueba de seguridad",()=>assert.deepEqual(reviewLiryBoostCentralSecurity({...verified,source:"local_memory"}),{permitted:false,reason:"central_unavailable"}));
test("rechaza respuesta central sin confirmación",()=>assert.deepEqual(reviewLiryBoostCentralSecurity({...verified,confirmed:false}),{permitted:false,reason:"not_confirmed"}));
test("rechaza operación bloqueada centralmente",()=>assert.deepEqual(reviewLiryBoostCentralSecurity({...verified,allowed:false}),{permitted:false,reason:"blocked"}));
