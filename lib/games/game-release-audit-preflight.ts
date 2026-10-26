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
 if(!["approved","rejected","pending"].includes(draft.decision))reasons.push("invalid_review_decision");
 if(draft.decision!=="approved"&&draft.readiness==="ready")reasons.push("inconsistent_review_state");
 if(!Array.isArray(draft.reasons)||draft.reasons.some(r=>typeof r!=="string"||!r||r.length>128)||draft.reasons.length>32)reasons.push("invalid_reason_codes");
 if(draft.readiness==="blocked"&&(!Array.isArray(draft.reasons)||draft.reasons.length===0))reasons.push("missing_block_reasons");
 if(draft.readiness==="ready"&&Array.isArray(draft.reasons)&&draft.reasons.length!==0)reasons.push("inconsistent_review_state");
 const auditedTime=Date.parse(draft.recordedAt);
 if(typeof draft.recordedAt!=="string"||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(draft.recordedAt)||!Number.isFinite(auditedTime)||new Date(auditedTime).toISOString()!==draft.recordedAt)reasons.push("invalid_audit_timestamp");
 return {accepted:reasons.length===0,publishAuthorized:false,reasons};
}
