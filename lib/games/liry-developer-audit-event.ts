/** Audit-event contract for future Liry Developers back-end.
 * Pure redaction: NO persistence, external provider or collection of documents.
 */
export type DeveloperAuditAction=
 "application_started"|"document_received"|"review_started"|"correction_requested"|
 "document_verified"|"document_rejected"|"identity_status_changed"|"bank_status_changed"|
 "rights_status_changed"|"admission_decided"|"document_expired"|"document_deleted";
export type DeveloperAuditActorType="applicant"|"verified_provider"|"authorized_reviewer"|"system";
export type DeveloperAuditEvent={
 eventId:string;
 applicationId:string;
 action:DeveloperAuditAction;
 actorType:DeveloperAuditActorType;
 actorReference:string;
 occurredAt:string;
 result:"accepted"|"denied"|"pending";
 correlationId:string;
};
export function createSafeDeveloperAuditEvent(input:DeveloperAuditEvent):DeveloperAuditEvent|null{
 const id=/^[a-zA-Z0-9_-]{6,100}$/;
 const timestamp=Date.parse(input.occurredAt);
 if(!id.test(input.eventId)||!id.test(input.applicationId)||!id.test(input.actorReference)||
    !id.test(input.correlationId)||!Number.isFinite(timestamp)||!/^\d{4}-\d{2}-\d{2}T/.test(input.occurredAt))return null;
 // Explicit whitelist prevents accidentally logging bank statements, IDs,
 // face images, document contents, access tokens and provider payloads.
 return {
  eventId:input.eventId,applicationId:input.applicationId,
  action:input.action,actorType:input.actorType,
  actorReference:input.actorReference,occurredAt:input.occurredAt,
  result:input.result,correlationId:input.correlationId
 };
}
