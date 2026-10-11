import test from "node:test";
import assert from "node:assert/strict";
import {auditInactiveLiryReadiness} from "../lib/games/liry-readiness-audit.ts";
import {getInactiveLiryGamerView,LIRY_INTEGRATION_PORTS} from "../lib/games/liry-integration-gateway.ts";
import {isLiryActivationReady,LIRY_ACTIVATION_REQUIREMENTS} from "../lib/games/liry-activation-readiness.ts";
import {isValidGameLink,LIRY_GAME_LINKS_PENDING} from "../lib/games/liry-game-link-contract.ts";
import {isLiryPublicIdentity,LIRY_VISITOR_IDENTITY} from "../lib/games/liry-id-contract.ts";
import {makePublicGamerSnapshot} from "../lib/games/public-gamer-snapshot.ts";

test("Liry ID permanece bloqueado, con siete requisitos pendientes",()=>{
 const result=auditInactiveLiryReadiness();
 assert.equal(result.status,"blocked");
 assert.equal(result.passed,0);
 assert.equal(result.required,7);
 assert.equal(result.blockedRequirementIds.length,7);
 assert.equal(isLiryActivationReady(false),false);
 assert.equal(isLiryActivationReady(true),false);
 assert.ok(LIRY_ACTIVATION_REQUIREMENTS.every(x=>x.ready===false));
});
test("estado público: visitante, sin cuenta ni datos de partidas",()=>{
 const view=getInactiveLiryGamerView();
 assert.equal(view.identity.kind,"visitor");
 assert.equal(view.identity.userId,null);
 assert.equal(view.available,false);
 assert.equal(view.activity.status,"visitor");
 assert.equal(view.activity.verifiedActivity,null);
 assert.equal(view.preferences.profileVisibility,"private");
 assert.equal(view.preferences.notifications.marketing,false);
});
test("los nueve vínculos siguen sin conexión y tienen códigos públicos únicos",()=>{
 const view=getInactiveLiryGamerView();
 assert.equal(view.gameLinks.length,9);
 assert.equal(new Set(view.gameLinks.map(link=>link.publicGameCode)).size,9);
 for(const link of view.gameLinks){
  assert.equal(link.status,"not_connected");
  assert.equal(link.source,null);
  assert.equal(link.lastVerifiedAt,null);
  assert.equal(isValidGameLink(link),true);
 }
 assert.equal(LIRY_GAME_LINKS_PENDING.length,9);
});
test("no aceptar estados vinculados incompletos o códigos no publicados",()=>{
 assert.equal(isValidGameLink({publicGameCode:"IP PROTEGIDA",status:"verified",source:"game_server",lastVerifiedAt:new Date().toISOString()}),false);
 assert.equal(isValidGameLink({publicGameCode:"LIRY // ARENA-01",status:"verified",source:null,lastVerifiedAt:null}),false);
 assert.equal(isValidGameLink({publicGameCode:"LIRY // ARENA-01",status:"not_connected",source:"game_server",lastVerifiedAt:null}),false);
});
test("ningún puerto de integración autenticado está configurado",()=>{
 assert.ok(Object.values(LIRY_INTEGRATION_PORTS).every(x=>x==="not_configured"));
});

test("identidad visitante y eventos sin comprobación nunca elevan privilegios",()=>{
 assert.equal(isLiryPublicIdentity(LIRY_VISITOR_IDENTITY),true);
 assert.equal(isLiryPublicIdentity({kind:"active",userId:null,displayName:"Visitante",verifiedAt:null}),false);
 assert.equal(makePublicGamerSnapshot(false,null).status,"visitor");
 assert.equal(makePublicGamerSnapshot(true,null,false).status,"identified_no_activity");
 const invented={accountId:"fake",verifiedAt:new Date().toISOString(),gamesPlayed:1,achievedCount:0,playMinutes:5,visitedWorldIds:[],achievementIds:[],experiencePoints:999};
 assert.equal(makePublicGamerSnapshot(true,invented,false).verifiedActivity,null);
});
