import type {ReleaseReviewAuditDraft} from "./game-release-review-audit";

/** Pure preflight validation only; persistence and access control belong to a trusted backend. */
export type AuditAppendPreflight={accepted:boolean;publishAuthorized:false;reasons:string[]};
export function preflightReleaseReviewAuditAppend(
 draft:ReleaseReviewAuditDraft,
 server:{actorUserId:string;gameId:string;releaseId:string;commitSha:string;deploymentId:string;validationRunId:string;idempotencyKey:string;alreadyExists:boolean}
):AuditAppendPreflight{
 const reasons:string[]=[];
 if(!server.actorUserId||draft.actorUserId!==server.actorUserId)reasons.push("actor_mismatch");
 if(!server.gameId||!server.releaseId||draft.gameId!==server.gameId||draft.releaseId!==server.releaseId)reasons.push("release_mismatch");
 if(!server.commitSha||!server.deploymentId||!server.validationRunId||draft.commitSha!==server.commitSha||draft.deploymentId!==server.deploymentId||draft.validationRunId!==server.validationRunId)reasons.push("evidence_mismatch");
 if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]{15,127}$/.test(server.idempotencyKey))reasons.push("invalid_idempotency_key");
 if(server.alreadyExists)reasons.push("duplicate_audit_event");
 if(draft.publishAuthorized!==false)reasons.push("publication_grant_forbidden");
 if(draft.readiness!=="ready"&&draft.readiness!=="blocked")reasons.push("invalid_readiness");
 return {accepted:reasons.length===0,publishAuthorized:false,reasons};
}
