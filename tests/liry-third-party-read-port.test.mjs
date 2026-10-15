import {chainEditorialDecisions} from "../lib/games/liry-editorial-hash-chain.ts";
import test from "node:test";
import assert from "node:assert/strict";
import {readAuthorizedExternalCatalog} from "../lib/games/liry-external-catalog-read-port.ts";
const evidence={gameId:"external-1",versionId:"v1",reviewedVersionId:"v1",reviewedArtifactHash:"a".repeat(64),reviewerId:"reviewer",decision:"approved",decidedAt:"2026-10-14T22:00:00Z",rightsReviewed:true,executableReviewed:true,publicationEnabled:true,submission:{developerId:"dev",gameId:"external-1",model:"premium",state:"approved",artifactHash:"a".repeat(64),approvedArtifactHash:"a".repeat(64),ownerVerified:true,commercialRightsVerified:true,humanApproved:true}};
const editorialHistory=[{gameId:"external-1",versionId:"v1",artifactHash:"a".repeat(64),sequence:1,action:"approve",reviewerId:"reviewer",decidedAt:"2026-10-14T22:00:00Z",approvalId:"initial-1"}];
const chainedHistory=chainEditorialDecisions(editorialHistory);
const expectedFinalHash=chainedHistory[0].hash;
const custodian={readTrustedAnchor:async()=>({gameId:"external-1",sequence:1,finalHash:expectedFinalHash,custodianId:"separate"})};
const editorialControl={gameId:"external-1",currentVersionId:"v1",approvalVersionId:"v1",approvalArtifactHash:"a".repeat(64),state:"active"};
const record={gameId:"external-1",published:true,releaseApproved:true,submission:{developerId:"dev",gameId:"external-1",model:"premium",state:"approved",artifactHash:"a".repeat(64),approvedArtifactHash:"a".repeat(64),ownerVerified:true,commercialRightsVerified:true,humanApproved:true},publicCard:{slug:"external-1",title:"Fixture local",description:"No publicar",model:"premium",coverUrl:null,developerId:"secret"}};
test("disabled read never invokes provider",async()=>{let calls=0;const port={readApprovedRecords:async()=>{calls++;return [record];}};assert.deepEqual(await readAuthorizedExternalCatalog(port,{sourceApproved:false,publicReadEnabled:true,humanReleaseGateEnabled:true,independentCustodyEnabled:true}),[]);assert.deepEqual(await readAuthorizedExternalCatalog(port,{sourceApproved:true,publicReadEnabled:false,humanReleaseGateEnabled:true,independentCustodyEnabled:true}),[]);assert.equal(calls,0);});
test("missing provider and failures are closed",async()=>{const permission={sourceApproved:true,publicReadEnabled:true,humanReleaseGateEnabled:true,independentCustodyEnabled:true};assert.deepEqual(await readAuthorizedExternalCatalog(null,permission),[]);assert.deepEqual(await readAuthorizedExternalCatalog({readApprovedRecords:async()=>{throw Error("offline");}},permission),[]);});
test("authorized read projects only public fields",async()=>{const cards=await readAuthorizedExternalCatalog({readApprovedRecords:async()=>[{record,evidence,editorialControl,editorialHistory,chainedHistory,expectedFinalHash}]},{sourceApproved:true,publicReadEnabled:true,humanReleaseGateEnabled:true,independentCustodyEnabled:true},custodian);assert.deepEqual(cards,[{slug:"external-1",title:"Fixture local",description:"No publicar",model:"premium",coverUrl:null}]);});
test("approved read cannot override release checks",async()=>{const bad={...record,submission:{...record.submission,humanApproved:false}};assert.deepEqual(await readAuthorizedExternalCatalog({readApprovedRecords:async()=>[{record:bad,evidence,editorialControl,editorialHistory,chainedHistory,expectedFinalHash}]},{sourceApproved:true,publicReadEnabled:true,humanReleaseGateEnabled:true,independentCustodyEnabled:true},custodian),[]);});

test("missing human gate prevents provider invocation",async()=>{let called=false;const port={readApprovedRecords:async()=>{called=true;return [{record,evidence,editorialControl,editorialHistory,chainedHistory,expectedFinalHash}]}};assert.deepEqual(await readAuthorizedExternalCatalog(port,{sourceApproved:true,publicReadEnabled:true,humanReleaseGateEnabled:false,independentCustodyEnabled:true}),[]);assert.equal(called,false)});

test("custody not configured prevents source reads",async()=>{let calls=0;const p={readApprovedRecords:async()=>{calls++;return []}};assert.deepEqual(await readAuthorizedExternalCatalog(p,{sourceApproved:true,publicReadEnabled:true,humanReleaseGateEnabled:true,independentCustodyEnabled:true}),[]);assert.equal(calls,0);});

test("full pipeline rejects a forged anchor, amended decisions and revoked snapshots",async()=>{
 const valid={record,evidence,editorialControl,editorialHistory,chainedHistory,expectedFinalHash};
 const allow={sourceApproved:true,publicReadEnabled:true,humanReleaseGateEnabled:true,independentCustodyEnabled:true};
 const forged={readTrustedAnchor:async()=>({gameId:"external-1",sequence:1,finalHash:"b".repeat(64),custodianId:"separate"})};
 assert.deepEqual(await readAuthorizedExternalCatalog({readApprovedRecords:async()=>[valid]},allow,forged),[]);
 const altered={...valid,editorialHistory:[{...editorialHistory[0],reviewerId:"other"}]};
 assert.deepEqual(await readAuthorizedExternalCatalog({readApprovedRecords:async()=>[altered]},allow,custodian),[]);
 const revoked={...valid,editorialControl:{...editorialControl,state:"revoked"}};
 assert.deepEqual(await readAuthorizedExternalCatalog({readApprovedRecords:async()=>[revoked]},allow,custodian),[]);
 const mismatched={...valid,expectedFinalHash:"b".repeat(64)};
 assert.deepEqual(await readAuthorizedExternalCatalog({readApprovedRecords:async()=>[mismatched]},allow,custodian),[]);
});
test("full pipeline does not publish malformed or unavailable source",async()=>{
 const allow={sourceApproved:true,publicReadEnabled:true,humanReleaseGateEnabled:true,independentCustodyEnabled:true};
 assert.deepEqual(await readAuthorizedExternalCatalog({readApprovedRecords:async()=>({record})},allow,custodian),[]);
 assert.deepEqual(await readAuthorizedExternalCatalog({readApprovedRecords:async()=>{throw Error("unavailable")}},allow,custodian),[]);
});
