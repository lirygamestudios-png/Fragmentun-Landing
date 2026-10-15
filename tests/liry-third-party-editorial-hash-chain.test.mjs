import test from "node:test";
import assert from "node:assert/strict";
import {chainEditorialDecisions,verifyEditorialHashChain} from "../lib/games/liry-editorial-hash-chain.ts";
const a={gameId:"g1",versionId:"v1",artifactHash:"a".repeat(64),sequence:1,action:"approve",reviewerId:"r1",decidedAt:"2026-10-14T20:00:00Z",approvalId:"a1"};
const b={...a,sequence:2,action:"suspend",approvalId:"a2",decidedAt:"2026-10-14T20:01:00Z"};
test("validated hash chain recovers only intact events",()=>{const chain=chainEditorialDecisions([a,b]);assert.deepEqual(verifyEditorialHashChain(chain,chain[1].hash),[a,b]);});
test("changing reviewer, executable or decision invalidates anchored chain",()=>{const chain=chainEditorialDecisions([a,b]);for(const changed of [{...b,reviewerId:"r2"},{...b,artifactHash:"b".repeat(64)},{...b,action:"revoke"}])assert.equal(verifyEditorialHashChain([chain[0],{...chain[1],decision:changed}],chain[1].hash),null);});
test("omitted, reordered and duplicated events are rejected",()=>{const chain=chainEditorialDecisions([a,b]);assert.equal(verifyEditorialHashChain([chain[1]],chain[1].hash),null);assert.equal(verifyEditorialHashChain([chain[1],chain[0]],chain[1].hash),null);assert.equal(verifyEditorialHashChain([chain[0],chain[0]],chain[1].hash),null);});
test("hash chain needs independent final anchor",()=>{const chain=chainEditorialDecisions([a,b]);assert.equal(verifyEditorialHashChain(chain,chain[0].hash),null);assert.equal(verifyEditorialHashChain(chain,"invalid"),null);});
