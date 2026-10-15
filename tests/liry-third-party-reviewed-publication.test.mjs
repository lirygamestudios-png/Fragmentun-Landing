import test from "node:test";
import assert from "node:assert/strict";
import {projectTraceablyReviewedExternalCatalog} from "../lib/games/liry-reviewed-publication-gate.ts";
const hash="a".repeat(64);
const submission={developerId:"dev",gameId:"game-1",model:"freemium",state:"approved",artifactHash:hash,approvedArtifactHash:hash,ownerVerified:true,commercialRightsVerified:true,humanApproved:true};
const record={gameId:"game-1",published:true,releaseApproved:true,submission,publicCard:{slug:"approved-game",title:"Fixture aislada",description:"Solo pruebas",model:"freemium",coverUrl:null}};
const evidence={gameId:"game-1",versionId:"v1",reviewedVersionId:"v1",reviewedArtifactHash:hash,submission,reviewerId:"reviewer-1",decision:"approved",decidedAt:"2026-10-14T22:00:00Z",rightsReviewed:true,executableReviewed:true,publicationEnabled:true};
const editorialHistory=[{gameId:"game-1",versionId:"v1",artifactHash:hash,sequence:1,action:"approve",reviewerId:"reviewer-1",decidedAt:"2026-10-14T22:00:00Z",approvalId:"initial-1"}];
const editorialControl={gameId:"game-1",currentVersionId:"v1",approvalVersionId:"v1",approvalArtifactHash:hash,state:"active"};
const candidate={record,evidence,editorialControl,editorialHistory};
const enabled={sourceApproved:true,humanReleaseGateEnabled:true};
test("private release gate defaults to no external publications",()=>{
 assert.deepEqual(projectTraceablyReviewedExternalCatalog([candidate],{...enabled,humanReleaseGateEnabled:false}),[]);
 assert.deepEqual(projectTraceablyReviewedExternalCatalog([candidate],{...enabled,sourceApproved:false}),[]);
 assert.deepEqual(projectTraceablyReviewedExternalCatalog(null,enabled),[]);
});
test("reviewed record exposes only public fields",()=>assert.deepEqual(projectTraceablyReviewedExternalCatalog([candidate],enabled),[{slug:"approved-game",title:"Fixture aislada",description:"Solo pruebas",model:"freemium",coverUrl:null}]));
test("new executable version requires separate review",()=>{
 assert.deepEqual(projectTraceablyReviewedExternalCatalog([{record,editorialControl,editorialHistory,evidence:{...evidence,versionId:"v2"}}],enabled),[]);
});
test("different reviewed hash, developer, game or commercial model cannot reuse evidence",()=>{
 const modified=[
  {...record,submission:{...submission,artifactHash:"b".repeat(64)}},
  {...record,submission:{...submission,developerId:"other"}},
  {...record,submission:{...submission,model:"premium"}},
  {...record,gameId:"other"}
 ];
 for(const item of modified)assert.deepEqual(projectTraceablyReviewedExternalCatalog([{record:item,evidence,editorialControl,editorialHistory}],enabled),[]);
});
test("rejected, unpublished, or unapproved games remain invisible",()=>{
 for(const c of [
  {record:{...record,published:false},evidence,editorialControl,editorialHistory},
  {record:{...record,releaseApproved:false},evidence,editorialControl,editorialHistory},
  {record,editorialControl,editorialHistory,evidence:{...evidence,decision:"pending"}},
  {record,editorialControl,editorialHistory,evidence:{...evidence,rightsReviewed:false}}
 ])assert.deepEqual(projectTraceablyReviewedExternalCatalog([c],enabled),[]);
});

test("revocation suspension and replacement block old releases",()=>{for(const state of ["suspended","revoked","replacement_pending"])assert.deepEqual(projectTraceablyReviewedExternalCatalog([{...candidate,editorialControl:{...editorialControl,state}}],enabled),[]);assert.deepEqual(projectTraceablyReviewedExternalCatalog([{...candidate,editorialControl:{...editorialControl,currentVersionId:"v2"}}],enabled),[]);});

test("fabricated active state and missing editorial history cannot publish",()=>{assert.deepEqual(projectTraceablyReviewedExternalCatalog([{...candidate,editorialHistory:[]}],enabled),[]);assert.deepEqual(projectTraceablyReviewedExternalCatalog([{...candidate,editorialHistory:[{...editorialHistory[0],action:"suspend"}]}],enabled),[]);});

test("editorial decision must match evidence reviewer, timestamp and version",()=>{
 for(const history of [
  [{...editorialHistory[0],reviewerId:"other-reviewer"}],
  [{...editorialHistory[0],decidedAt:"2026-10-14T22:01:00Z"}],
  [{...editorialHistory[0],versionId:"v2"}],
  [{...editorialHistory[0],artifactHash:"b".repeat(64)}]
 ])assert.deepEqual(projectTraceablyReviewedExternalCatalog([{...candidate,editorialHistory:history}],enabled),[]);
});
test("a distinct reviewer cannot claim another review decision",()=>{
 assert.deepEqual(projectTraceablyReviewedExternalCatalog([{...candidate,evidence:{...evidence,reviewerId:"other-reviewer"}}],enabled),[]);
});
