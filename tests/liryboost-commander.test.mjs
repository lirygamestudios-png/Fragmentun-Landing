import test from "node:test";
import assert from "node:assert/strict";
import {summarizeLiryBoostReferrals} from "../lib/liryboost/commander-contract.ts";
const base={eventId:"1",referrerUserId:"a",invitedUserId:"b",status:"pending",occurredAt:"2026-10-01T00:00:00Z",verifiedAt:null};
test("no cuenta invitaciones pendientes como verificadas",()=>{
 const result=summarizeLiryBoostReferrals([base],"a");
 assert.equal(result.verifiedInvitations,0);
 assert.equal(result.pendingInvitations,1);
});
test("una revocación posterior elimina del conteo verificado",()=>{
 const result=summarizeLiryBoostReferrals([
  {...base,status:"verified",verifiedAt:"2026-10-02T00:00:00Z",occurredAt:"2026-10-02T00:00:00Z"},
  {...base,eventId:"2",status:"revoked",verifiedAt:null,occurredAt:"2026-10-03T00:00:00Z"}
 ],"a");
 assert.equal(result.verifiedInvitations,0);
 assert.equal(result.revokedInvitations,1);
});
test("ignora eventos de otro participante",()=>{
 const result=summarizeLiryBoostReferrals([{...base,referrerUserId:"other"}],"a");
 assert.equal(result.pendingInvitations,0);
});

test("fecha inválida de verificación no se trata como revocación",()=>{
 const r=summarizeLiryBoostReferrals([{...base,status:"verified",verifiedAt:"sin-fecha"}],"a");
 assert.equal(r.verifiedInvitations,0);
 assert.equal(r.revokedInvitations,0);
});
test("evento sin fecha válida no modifica el estado vigente",()=>{
 const r=summarizeLiryBoostReferrals([base,{...base,eventId:"2",occurredAt:"fecha-mala",status:"revoked"}],"a");
 assert.equal(r.pendingInvitations,1);
 assert.equal(r.revokedInvitations,0);
});
