import {inspectInvitationBatch} from "./invitation-integrity.ts";
/** Política preparatoria cerrada: nunca acredita invitaciones reales. */
export type InvitationCreditContext={
 programActive:boolean;rulesPublished:boolean;issuerAuthorized:boolean;
 identitiesVerified:boolean;consentsAudited:boolean;persistentDeduplication:boolean;
};
export type InvitationCreditDecision="invalid"|"requires_verification"|"inactive";
export function inspectInactiveInvitationCredit(batch:unknown,context:InvitationCreditContext):InvitationCreditDecision{
 if(inspectInvitationBatch(batch)!=="eligible_for_server_review")return "invalid";
 if(!context.programActive||!context.rulesPublished)return "inactive";
 if(!context.issuerAuthorized||!context.identitiesVerified||!context.consentsAudited||!context.persistentDeduplication)
  return "requires_verification";
 return "inactive"; // Activación expresamente bloqueada hasta infraestructura real y pruebas end-to-end.
}
