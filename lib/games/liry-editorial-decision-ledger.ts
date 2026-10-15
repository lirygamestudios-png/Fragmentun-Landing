import type {ExternalEditorialControl} from "./liry-editorial-revocation";

/** Private, pure replay of human editorial decisions. No database or user actions. */
export type EditorialDecision={
 gameId:string; versionId:string; artifactHash:string; sequence:number;
 action:"approve"|"suspend"|"revoke"|"replace_pending"|"reactivate";
 reviewerId:string; decidedAt:string; approvalId:string;
};
const validId=(x:unknown)=>typeof x==="string"&&x.length>0&&x.length<=160&&x.trim()===x;
const validHash=(x:unknown)=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
export function replayExternalEditorialDecisions(events:readonly EditorialDecision[]|unknown):ExternalEditorialControl|null{
 if(!Array.isArray(events)||events.length===0)return null;
 let prior:EditorialDecision|null=null;
 let snapshot:ExternalEditorialControl|null=null;
 let suspended=false;
 const usedApprovals=new Set<string>();
 for(const event of events){
  if(!event||typeof event!=="object"||Array.isArray(event))return null;
  const e=event as EditorialDecision;
  if(!validId(e.gameId)||!validId(e.versionId)||!validHash(e.artifactHash)||
     !validId(e.reviewerId)||!validId(e.approvalId)||
     !Number.isSafeInteger(e.sequence)||e.sequence<1||
     (!prior&&e.sequence!==1)||
     typeof e.decidedAt!=="string"||
     !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(e.decidedAt)||
     !Number.isFinite(Date.parse(e.decidedAt))||
     (prior&&(e.sequence!==prior.sequence+1||e.gameId!==prior.gameId||
        Date.parse(e.decidedAt)<Date.parse(prior.decidedAt))))return null;
  if(usedApprovals.has(e.approvalId))return null;
  usedApprovals.add(e.approvalId);
  if(e.action==="approve"){
   if(snapshot!==null)return null;
   snapshot={gameId:e.gameId,currentVersionId:e.versionId,approvalVersionId:e.versionId,approvalArtifactHash:e.artifactHash,state:"active"};
  }else if(e.action==="suspend"||e.action==="revoke"||e.action==="replace_pending"){
   if(!snapshot||snapshot.state!=="active"||
      (e.versionId!==snapshot.currentVersionId||e.artifactHash!==snapshot.approvalArtifactHash))return null;
   snapshot={gameId:e.gameId,currentVersionId:e.versionId,approvalVersionId:e.versionId,approvalArtifactHash:e.artifactHash,state:e.action==="suspend"?"suspended":e.action==="revoke"?"revoked":"replacement_pending"};
   suspended=true;
  }else if(e.action==="reactivate"){
   // Reinstatement always requires a NEW review ID and a new explicit event;
   // a revoked record is terminal and must be submitted as a fresh listing.
   if(!snapshot||!suspended||
      (snapshot.state!=="suspended"&&snapshot.state!=="replacement_pending"))return null;
   snapshot={gameId:e.gameId,currentVersionId:e.versionId,approvalVersionId:e.versionId,approvalArtifactHash:e.artifactHash,state:"active"};
   suspended=false;
  }else return null;
  prior=e;
 }
 return snapshot;
}
