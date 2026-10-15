import test from "node:test";
import assert from "node:assert/strict";
import {releaseHasTraceableHumanApproval} from "../lib/games/liry-independent-release-evidence.ts";
const hash="a".repeat(64);
const submission={developerId:"dev",gameId:"game-1",model:"freemium",state:"approved",artifactHash:hash,approvedArtifactHash:hash,ownerVerified:true,commercialRightsVerified:true,humanApproved:true};
const valid={gameId:"game-1",versionId:"v1",submission,reviewedVersionId:"v1",reviewedArtifactHash:hash,reviewerId:"reviewer-1",decision:"approved",decidedAt:"2026-10-14T22:00:00Z",rightsReviewed:true,executableReviewed:true,publicationEnabled:true};
test("private approval contract requires exact game, version, artifact and reviewer",()=>{
 assert.equal(releaseHasTraceableHumanApproval(valid),true);
 for(const entry of [
  {...valid,gameId:"another"},
  {...valid,reviewedVersionId:"v2"},
  {...valid,reviewedArtifactHash:"b".repeat(64)},
  {...valid,reviewerId:""},
  {...valid,decision:"pending"},
  {...valid,rightsReviewed:false},
  {...valid,executableReviewed:false},
  {...valid,publicationEnabled:false},
  {...valid,decidedAt:"invalid"},
  {...valid,submission:{...submission,humanApproved:false}},
  {...valid,submission:{...submission,artifactHash:"b".repeat(64)}}
 ])assert.equal(releaseHasTraceableHumanApproval(entry),false);
});
test("new executable version requires a new human review",()=>assert.equal(releaseHasTraceableHumanApproval({...valid,versionId:"v2"}),false));
