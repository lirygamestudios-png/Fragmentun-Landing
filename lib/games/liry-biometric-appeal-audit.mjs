/** LIRYGAMES offline-only appeal audit/closure model. Never writes, sends or changes access. */
export const APPEAL_AUDIT_MODE = "offline_preview_only";
export const APPEAL_EVENT_TYPES = Object.freeze(["appeal_requested","reviewer_assigned","evidence_reviewed","decision_recommended","closure_proposed"]);
export const APPEAL_STAGES = Object.freeze(["appeal_requested","independent_review","decision_recommended","closure_proposed"]);
const allowed = {
 appeal_requested: {reviewer_assigned:"independent_review"},
 independent_review: {evidence_reviewed:"independent_review",decision_recommended:"decision_recommended"},
 decision_recommended: {closure_proposed:"closure_proposed"},
 closure_proposed: {}
};
function denied(reason) {
 return Object.freeze({accepted:false,reason,notified:false,accountChanged:false,persisted:false,closed:false});
}
const EVENT_KEYS = Object.freeze(["appeal_requested","reviewer_assigned","evidence_reviewed","decision_recommended","closure_proposed"]);
/** Pure offline duplicate and replay screening, never a persistence guarantee. */
export function previewAppealEventIntegrity({caseRef,eventId,seenEventIds=[],previousCaseRef,previousEventType,previousStage,expectedStage,previousSeq=0,seq=0,eventType,stage}={}) {
 if(!clean(caseRef)||!clean(eventId)||!Array.isArray(seenEventIds)||seenEventIds.length>1000) return denied("invalid_reference");
 if(seenEventIds.includes(eventId))return denied("duplicate_event");
 if(previousCaseRef && previousCaseRef!==caseRef)return denied("cross_case_replay");
 if(!Number.isSafeInteger(previousSeq)||!Number.isSafeInteger(seq)||seq!==previousSeq+1)return denied("invalid_sequence");
 if(!EVENT_KEYS.includes(eventType)||!APPEAL_STAGES.includes(stage)||!allowed[stage]?.[eventType])return denied("invalid_transition");
 if(expectedStage && expectedStage!==stage)return denied("stale_stage");
 if(previousEventType==="closure_proposed"||previousStage==="closure_proposed")return denied("already_proposed_closed");
 return denied("requires_authenticated_server");
}
const clean = value => typeof value === "string" && value.trim().length > 0 && value.length <= 128;
/**
 * Evaluate a proposed audit record. Caller supplies server-verified authorization in future;
 * this preview must NEVER interpret client supplied identity/roles as authentic.
 */
export function previewAppealAudit({caseRef,applicantRef,originalReviewerRef,independentReviewerRef,actorRef,actorRole,stage,eventType,legalHold=false,applicantConsent=false,seq=0,previousSeq=0}={}) {
 if(![caseRef,applicantRef,originalReviewerRef,independentReviewerRef,actorRef].every(clean)) return denied("invalid_reference");
 if(!Number.isSafeInteger(seq)||!Number.isSafeInteger(previousSeq)||seq<=0||seq!==previousSeq+1) return denied("invalid_sequence");
 if(!APPEAL_STAGES.includes(stage)||!APPEAL_EVENT_TYPES.includes(eventType)||!allowed[stage][eventType]) return denied("invalid_transition");
 if(originalReviewerRef===independentReviewerRef||applicantRef===independentReviewerRef) return denied("conflict_of_interest");
 if(!applicantConsent) return denied("consent_required");
 if(eventType==="reviewer_assigned" && (actorRole!=="independent_appeals_reviewer"||actorRef!==independentReviewerRef)) return denied("unauthorized_reviewer");
 if(["evidence_reviewed","decision_recommended","closure_proposed"].includes(eventType) && (actorRole!=="independent_appeals_reviewer"||actorRef!==independentReviewerRef)) return denied("unauthorized_reviewer");
 if(legalHold && eventType==="closure_proposed")return denied("legal_hold");
 return denied("requires_authenticated_server");
}
export function previewIndependentClosure({originalReviewerRef,independentReviewerRef,closingReviewerRef,legalHold=false,decisionRecorded=false,applicantNotified=false}={}) {
 if(![originalReviewerRef,independentReviewerRef,closingReviewerRef].every(clean))return denied("invalid_reference");
 if(new Set([originalReviewerRef,independentReviewerRef,closingReviewerRef]).size!==3)return denied("separation_of_duties");
 if(legalHold)return denied("legal_hold");
 if(!decisionRecorded || !applicantNotified)return denied("incomplete_process");
 return denied("requires_authenticated_server");
}
export function previewAppealClosure(language="es", reason="review_complete") {
 const es=language==="es";
 const subject=es?"Borrador de cierre de apelación":"Appeal closure draft";
 const message=es?
  "Propuesta de cierre pendiente de revisión y autorización. No se ha cerrado ningún expediente ni modificado el acceso. No envíes documentos de identidad por correo o chat.":
  "Proposed closure pending review and authorization. No case has been closed or access changed. Do not send identity documents by email or chat.";
 return Object.freeze({subject,message,reason:clean(reason)?reason:"review_complete",status:"draft",sent:false,closed:false,accountChanged:false});
}
