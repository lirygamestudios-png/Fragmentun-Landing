import test from "node:test";
import assert from "node:assert/strict";
import {inspectInactiveSecretsActivation,canActivateSecretsInPreview} from "../lib/games/liry-secrets-activation.ts";
const ready={gameLive:true,rulesPublished:true,gameServerAuthorized:true,agePolicyReviewed:true,rewardInventoryVerified:true,auditLogReady:true,idempotentCompletionStoreReady:true};
test("sin videojuego real o bases publicadas secretos no se activan",()=>{
 assert.equal(inspectInactiveSecretsActivation({...ready,gameLive:false}),"missing_requirements");
 assert.equal(inspectInactiveSecretsActivation({...ready,rulesPublished:false}),"missing_requirements");
});
test("sin inventario de recompensas o control de edad se bloquea",()=>{
 assert.equal(inspectInactiveSecretsActivation({...ready,rewardInventoryVerified:false}),"missing_requirements");
 assert.equal(inspectInactiveSecretsActivation({...ready,agePolicyReviewed:false}),"missing_requirements");
});
test("sin auditoría persistente e idempotencia no se habilitan secretos",()=>{
 assert.equal(inspectInactiveSecretsActivation({...ready,auditLogReady:false}),"missing_requirements");
 assert.equal(inspectInactiveSecretsActivation({...ready,idempotentCompletionStoreReady:false}),"missing_requirements");
});
test("aun con requisitos declarados, integración real sigue pendiente",()=>{
 assert.equal(inspectInactiveSecretsActivation(ready),"awaiting_live_integration");
 assert.equal(canActivateSecretsInPreview(),false);
});
