import test from "node:test";import assert from "node:assert/strict";
import {selectUnambiguousVerifiedInvites} from "../lib/liryboost/verified-invite-counts.ts";
const event=(eventId,referrerUserId,invitedUserId,status="verified",occurredAt="2026-10-01T10:00:00Z")=>({eventId,referrerUserId,invitedUserId,status,occurredAt,verifiedAt:status==="verified"?occurredAt:null});
test("un invitado verificado aporta un punto",()=>assert.equal(selectUnambiguousVerifiedInvites([event("1","A","B")]).get("A"),1));
test("autoinvitación no cuenta",()=>assert.equal(selectUnambiguousVerifiedInvites([event("1","A","A")]).size,0));
test("dos referidores en conflicto no reciben puntos",()=>assert.equal(selectUnambiguousVerifiedInvites([event("1","A","B"),event("2","C","B")]).size,0));
test("revocación posterior elimina punto",()=>assert.equal(selectUnambiguousVerifiedInvites([event("1","A","B"),event("2","A","B","revoked","2026-10-02T10:00:00Z")]).size,0));
test("repetir ID de evento no duplica puntos",()=>assert.equal(selectUnambiguousVerifiedInvites([event("1","A","B"),event("1","A","B")]).get("A"),1));

test("mismo ID reutilizado con otro invitado invalida atribución afectada",()=>{
 const rows=[event("1","A","B"),event("1","C","D")];
 assert.equal(selectUnambiguousVerifiedInvites(rows).size,0);
});
