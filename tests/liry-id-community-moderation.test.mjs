import test from "node:test";
import assert from "node:assert/strict";
import {inspectInactiveCommunitySubmission,canAutoPublishCommunityContent} from "../lib/games/liry-community-moderation.ts";
test("la comunidad no permite publicación automática",()=>{
 assert.equal(canAutoPublishCommunityContent(),false);
});
test("envíos sin autenticación o consentimiento permanecen bloqueados",()=>{
 const base={category:"posts",authenticated:true,consent:true,body:"Hola comunidad"};
 assert.equal(inspectInactiveCommunitySubmission({...base,authenticated:false}),"blocked_inactive");
 assert.equal(inspectInactiveCommunitySubmission({...base,consent:false}),"blocked_inactive");
});
test("las solicitudes de aspecto válido requieren moderación antes de publicar",()=>{
 assert.equal(inspectInactiveCommunitySubmission({category:"posts",authenticated:true,consent:true,body:"Hola"}),"needs_review");
});
test("categorías desconocidas o carga malformada se rechazan",()=>{
 assert.equal(inspectInactiveCommunitySubmission({category:"private-ip",authenticated:true,consent:true,body:"Hola"}),"reject");
 assert.equal(inspectInactiveCommunitySubmission({category:"posts",authenticated:true,consent:true,body:"x".repeat(1001)}),"reject");
 assert.equal(inspectInactiveCommunitySubmission(null),"reject");
});
