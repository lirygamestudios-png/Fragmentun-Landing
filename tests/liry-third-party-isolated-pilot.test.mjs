import test from "node:test";
import assert from "node:assert/strict";
import {chainEditorialDecisions} from "../lib/games/liry-editorial-hash-chain.ts";
import {readAuthorizedExternalCatalog} from "../lib/games/liry-external-catalog-read-port.ts";

/** Ephemeral, synthetic, no production DB, no external I/O. Reviewer identity
 * below is a locally injected test assertion, NOT production authentication. */
const hash="a".repeat(64);
const decision={gameId:"synthetic-game-1",versionId:"v1",artifactHash:hash,sequence:1,action:"approve",reviewerId:"synthetic-reviewer",decidedAt:"2026-10-15T20:00:00Z",approvalId:"test-1"};
const editorialHistory=[decision],chainedHistory=chainEditorialDecisions(editorialHistory);
const expectedFinalHash=chainedHistory[0].hash;
const submission={developerId:"synthetic-developer",gameId:decision.gameId,model:"premium",state:"approved",artifactHash:hash,approvedArtifactHash:hash,ownerVerified:true,commercialRightsVerified:true,humanApproved:true};
const evidence={gameId:decision.gameId,versionId:"v1",reviewedVersionId:"v1",reviewedArtifactHash:hash,submission,reviewerId:decision.reviewerId,decision:"approved",decidedAt:decision.decidedAt,rightsReviewed:true,executableReviewed:true,publicationEnabled:true};
const reviewerAssertion={reviewerId:"synthetic-reviewer",verifiedByTrustedProvider:true,active:true,roles:["external_release_reviewer"],allowedGameIds:["synthetic-game-1"]};
const editorialControl={gameId:decision.gameId,currentVersionId:"v1",approvalVersionId:"v1",approvalArtifactHash:hash,state:"active"};
const record={gameId:decision.gameId,published:true,releaseApproved:true,submission,publicCard:{slug:"synthetic-game-1",title:"Synthetic Fixture",description:"Testing only",model:"premium",coverUrl:null,developerId:"private"}};
const candidate={record,evidence,editorialControl,editorialHistory,chainedHistory,expectedFinalHash,reviewerAssertion};
const permission={sourceApproved:true,publicReadEnabled:true,humanReleaseGateEnabled:true,independentCustodyEnabled:true};
const syntheticCustodian={readTrustedAnchor:async gameId=>({gameId,sequence:1,finalHash:expectedFinalHash,custodianId:"synthetic-independent-anchor"})};
const trustedAuthority={readReviewerAuthority:async()=>({reviewerId:"synthetic-reviewer",verifiedByTrustedProvider:true,active:true,roles:["external_release_reviewer"],allowedGameIds:["synthetic-game-1"]})};
const provider=rows=>({readApprovedRecords:async()=>rows});
test("synthetic isolated approved route strips internal identifiers",async()=>{
 const cards=await readAuthorizedExternalCatalog(provider([candidate]),permission,syntheticCustodian,trustedAuthority);
 assert.deepEqual(cards,[{slug:"synthetic-game-1",title:"Synthetic Fixture",description:"Testing only",model:"premium",coverUrl:null}]);
});
test("synthetic isolated mismatched claimed reviewer cannot publish",async()=>{
 const forged={...candidate,evidence:{...evidence,reviewerId:"different-reviewer"}};
 assert.deepEqual(await readAuthorizedExternalCatalog(provider([forged]),permission,syntheticCustodian,trustedAuthority),[]);
});
test("synthetic isolated unpublished or revoked release cannot publish",async()=>{
 for(const c of [{...candidate,record:{...record,published:false}},{...candidate,editorialControl:{...editorialControl,state:"revoked"}}]){
  assert.deepEqual(await readAuthorizedExternalCatalog(provider([c]),permission,syntheticCustodian,trustedAuthority),[]);
 }
});
test("synthetic isolated disabled permissions and missing custody never read provider",async()=>{
 let calls=0;
 const tracking={readApprovedRecords:async()=>{calls++;return [candidate]}};
 assert.deepEqual(await readAuthorizedExternalCatalog(tracking,{...permission,independentCustodyEnabled:false},syntheticCustodian,trustedAuthority),[]);
 assert.deepEqual(await readAuthorizedExternalCatalog(tracking,permission,null),[]);
 assert.equal(calls,0);
});
test("synthetic isolated read errors fail closed",async()=>{
 assert.deepEqual(await readAuthorizedExternalCatalog({readApprovedRecords:async()=>{throw Error("offline")}},permission,syntheticCustodian,trustedAuthority),[]);
});

test("a forged reviewer permission in external data cannot publish",async()=>{
 const forged={...candidate,reviewerAssertion:{...reviewerAssertion,reviewerId:"attacker",roles:["external_release_reviewer"]}};
 const cards=await readAuthorizedExternalCatalog(provider([forged]),permission,syntheticCustodian,trustedAuthority);
 assert.equal(cards.length,1);
 // The server supplies the authority; the untrusted forged declaration is ignored.
 const denied={readReviewerAuthority:async()=>({reviewerId:"synthetic-reviewer",verifiedByTrustedProvider:false,active:true,roles:["external_release_reviewer"],allowedGameIds:["synthetic-game-1"]})};
 assert.deepEqual(await readAuthorizedExternalCatalog(provider([candidate]),permission,syntheticCustodian,denied),[]);
});
test("missing trusted identity provider prevents reading even synthetic source",async()=>{
 let called=0;
 assert.deepEqual(await readAuthorizedExternalCatalog({readApprovedRecords:async()=>{called++;return [candidate]}},permission,syntheticCustodian,null),[]);
 assert.equal(called,0);
});
