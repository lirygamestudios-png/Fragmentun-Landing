import test from "node:test";
import assert from "node:assert/strict";
import {actorFromVerifiedCommanderSession} from "../lib/liryboost/commander-actor.ts";
import {canPerformLiryBoostAction} from "../lib/liryboost/access-policy.ts";
const trusted={userId:"admin-1",sessionVerified:true,commanderMfaVerified:true,trustedProfileRole:"admin"};
test("sesión sin MFA LIRYGAMES no otorga acceso",()=>assert.equal(canPerformLiryBoostAction(actorFromVerifiedCommanderSession({...trusted,commanderMfaVerified:false}),"publish_ranking"),false));
test("sesión ausente no otorga permisos",()=>assert.equal(actorFromVerifiedCommanderSession({...trusted,sessionVerified:false}).authenticated,false));
test("rol administrador con MFA puede publicar según contrato",()=>assert.equal(canPerformLiryBoostAction(actorFromVerifiedCommanderSession(trusted),"publish_ranking"),true));
test("rol no administrativo no puede publicar",()=>assert.equal(canPerformLiryBoostAction(actorFromVerifiedCommanderSession({...trusted,trustedProfileRole:"viewer"}),"publish_ranking"),false));
