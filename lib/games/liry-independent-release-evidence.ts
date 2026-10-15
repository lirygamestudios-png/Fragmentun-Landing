import {mayPublishDeveloperGame,type DeveloperSubmission} from "./liry-developer-publication";

/** Private review evidence: never serialize this record into a public card.
 * Prepared only; no persistence, authentication, signing, or release operations.
 */
export type IndependentReleaseEvidence={
 gameId:string;
 versionId:string;
 submission:DeveloperSubmission;
 reviewedVersionId:string;
 reviewedArtifactHash:string;
 reviewerId:string;
 decision:"approved"|"rejected"|"pending";
 decidedAt:string;
 rightsReviewed:boolean;
 executableReviewed:boolean;
 publicationEnabled:boolean;
};
export function releaseHasTraceableHumanApproval(e:IndependentReleaseEvidence):boolean{
 if(!e||typeof e!=="object")return false;
 if(typeof e.gameId!=="string"||!e.gameId.trim()||
    typeof e.versionId!=="string"||!e.versionId.trim()||
    e.versionId!==e.reviewedVersionId||
    typeof e.reviewerId!=="string"||!e.reviewerId.trim()||
    e.decision!=="approved"||e.rightsReviewed!==true||
    e.executableReviewed!==true||e.publicationEnabled!==true)return false;
 if(typeof e.decidedAt!=="string"||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(e.decidedAt)||
    !Number.isFinite(Date.parse(e.decidedAt)))return false;
 return e.gameId===e.submission?.gameId&&
    e.reviewedArtifactHash===e.submission.artifactHash&&
    e.reviewedArtifactHash===e.submission.approvedArtifactHash&&
    mayPublishDeveloperGame(e.submission);
}
