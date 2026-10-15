import {releaseHasTraceableHumanApproval,type IndependentReleaseEvidence} from "./liry-independent-release-evidence";
import {verifyEditorialHashChain,type ChainedEditorialDecision} from "./liry-editorial-hash-chain";
import {replayExternalEditorialDecisions,type EditorialDecision} from "./liry-editorial-decision-ledger";
import {permitsCurrentExternalRelease,type ExternalEditorialControl} from "./liry-editorial-revocation";
import {projectApprovedExternalSource} from "./liry-approved-source-boundary";
import type {PublicThirdPartyCard} from "./liry-developer-publication";

/** Private preparatory linkage. No live submissions, persistence or automatic release. */
export type ReviewedExternalCandidate={
  record:unknown;
  evidence:IndependentReleaseEvidence;
  editorialControl:ExternalEditorialControl;
  editorialHistory:readonly EditorialDecision[];
  chainedHistory:readonly ChainedEditorialDecision[];
  expectedFinalHash:string;
};
export function projectTraceablyReviewedExternalCatalog(
  candidates:readonly ReviewedExternalCandidate[]|unknown,
  options:{sourceApproved:boolean;humanReleaseGateEnabled:boolean}
):readonly PublicThirdPartyCard[]{
 if(options?.sourceApproved!==true||options?.humanReleaseGateEnabled!==true||!Array.isArray(candidates))return [];
 const eligible:unknown[]=[];
 for(const item of candidates){
  if(!item||typeof item!=="object"||Array.isArray(item))continue;
  const candidate=item as Record<string,unknown>;
  const record=candidate.record;
  const evidence=candidate.evidence;
  const control=candidate.editorialControl;
  const verifiedHistory=verifyEditorialHashChain(candidate.chainedHistory,candidate.expectedFinalHash);
  const history=candidate.editorialHistory;
  if(!verifiedHistory||JSON.stringify(verifiedHistory)!==JSON.stringify(history))continue;
  const authoritative=replayExternalEditorialDecisions(history);
  const latestDecision=Array.isArray(history)?history[history.length-1]:null;
  if(!record||typeof record!=="object"||Array.isArray(record)||
     !evidence||typeof evidence!=="object"||Array.isArray(evidence))continue;
  const r=record as Record<string,unknown>;
  const e=evidence as IndependentReleaseEvidence;
  if(typeof r.gameId!=="string"||r.gameId!==e.gameId||
     !releaseHasTraceableHumanApproval(e)||
     !authoritative||!latestDecision||
     (latestDecision.action!=="approve"&&latestDecision.action!=="reactivate")||
     latestDecision.gameId!==e.gameId||
     latestDecision.versionId!==e.versionId||
     latestDecision.artifactHash!==e.reviewedArtifactHash||
     latestDecision.reviewerId!==e.reviewerId||
     latestDecision.decidedAt!==e.decidedAt||
     !control||typeof control!=="object"||
     authoritative.gameId!==(control as ExternalEditorialControl).gameId||
     authoritative.currentVersionId!==(control as ExternalEditorialControl).currentVersionId||
     authoritative.approvalVersionId!==(control as ExternalEditorialControl).approvalVersionId||
     authoritative.approvalArtifactHash!==(control as ExternalEditorialControl).approvalArtifactHash||
     authoritative.state!==(control as ExternalEditorialControl).state||
     !permitsCurrentExternalRelease(authoritative,e.gameId,e.versionId,e.reviewedArtifactHash)||
     !permitsCurrentExternalRelease(control,e.gameId,e.versionId,e.reviewedArtifactHash))continue;
  const submission=r.submission;
  if(!submission||typeof submission!=="object"||Array.isArray(submission))continue;
  const s=submission as Record<string,unknown>;
  if(s.gameId!==e.submission.gameId||s.developerId!==e.submission.developerId||
     s.artifactHash!==e.reviewedArtifactHash||
     s.approvedArtifactHash!==e.reviewedArtifactHash||
     s.model!==e.submission.model)continue;
  eligible.push(record);
 }
 return projectApprovedExternalSource(eligible,{sourceApproved:true});
}
