/** Preparatory document status model. No real uploads or storage. */
export type DeveloperDocumentStatus="not_submitted"|"received"|"under_review"|"correction_required"|"verified"|"rejected"|"expired"|"deletion_scheduled"|"deleted";
export type DeveloperDocumentActor="applicant"|"authorized_reviewer"|"retention_service";
export type DeveloperDocumentEvent="received"|"start_review"|"request_correction"|"resubmitted"|"verify"|"reject"|"expire"|"schedule_deletion"|"confirm_deletion";
const transitions:Readonly<Record<DeveloperDocumentEvent,{from:readonly DeveloperDocumentStatus[];to:DeveloperDocumentStatus;actor:DeveloperDocumentActor}>>={
 received:{from:["not_submitted"],to:"received",actor:"applicant"},
 start_review:{from:["received"],to:"under_review",actor:"authorized_reviewer"},
 request_correction:{from:["under_review"],to:"correction_required",actor:"authorized_reviewer"},
 resubmitted:{from:["correction_required"],to:"received",actor:"applicant"},
 verify:{from:["under_review"],to:"verified",actor:"authorized_reviewer"},
 reject:{from:["under_review"],to:"rejected",actor:"authorized_reviewer"},
 expire:{from:["verified"],to:"expired",actor:"retention_service"},
 schedule_deletion:{from:["received","under_review","correction_required","verified","rejected","expired"],to:"deletion_scheduled",actor:"retention_service"},
 confirm_deletion:{from:["deletion_scheduled"],to:"deleted",actor:"retention_service"}
};
export const LIRY_DOCUMENT_INGESTION_ENABLED=false as const;
export function nextDeveloperDocumentStatus(current:DeveloperDocumentStatus,event:DeveloperDocumentEvent,actor:DeveloperDocumentActor,authorized:boolean):DeveloperDocumentStatus{
 if(!authorized||!LIRY_DOCUMENT_INGESTION_ENABLED)return current;
 const rule=transitions[event];
 return rule.actor===actor&&rule.from.includes(current)?rule.to:current;
}
/** Spec-only transition for isolated tests; never import into production UI or API. */
export function simulateDocumentTransition(current:DeveloperDocumentStatus,event:DeveloperDocumentEvent,actor:DeveloperDocumentActor):DeveloperDocumentStatus{
 const rule=transitions[event];
 return rule.actor===actor&&rule.from.includes(current)?rule.to:current;
}
