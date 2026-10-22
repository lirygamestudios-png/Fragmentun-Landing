import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Offline-only appeal policy preview. Does not process cases or alter accounts. */
export type AppealLanguage = "es" | "en";
export type AppealDecision = "uphold" | "recommend_reinstatement" | "needs_more_review";
export type AppealReason = "identity_mismatch" | "suspected_account_takeover" | "evidence_access_anomaly" | "manual_security_review";
export type AppealEvaluation = Readonly<{
  eligible: boolean; reason: "service_disabled" | "invalid_reference" | "unrecognized_reason" | "conflict_of_interest" | "missing_consent" | "legal_hold" | "requires_authenticated_server";
  canChangeAccount: false; canNotify: false; canPersist: false;
}>;
export type AppealReviewInput = Readonly<{
  applicantRef: string; caseRef: string; originalReviewerRef: string; independentReviewerRef: string;
  reasonCode: string; applicantRequested: boolean; consentToReview: boolean; legalHold: boolean;
}>;
export const appealReviewPolicy = Object.freeze({
  responseTargetBusinessDays: 10,
  acknowledgementTargetBusinessDays: 3,
  requiresLegalApprovalBeforePublication: true,
  clockStartsOnlyAfterAuthenticatedSubmission: true,
  deadlineIsNotLegallyGuaranteed: true,
  manualEscalationOnMiss: true,
  storesIdentityDocuments: false,
  sendsMessages: false,
});
/** No actual eligibility or transition is granted while the provider is disabled. */
export function assessAppealReview(input: AppealReviewInput): AppealEvaluation {
  const deny=(reason: AppealEvaluation["reason"]): AppealEvaluation=>({
    eligible:false,reason,canChangeAccount:false,canNotify:false,canPersist:false
  });
  if(biometricProviderStatus==="disabled")return deny("service_disabled");
  if(!input.caseRef?.trim()||!input.applicantRef?.trim()||!input.originalReviewerRef?.trim()||!input.independentReviewerRef?.trim())return deny("invalid_reference");
  if(!(["identity_mismatch","suspected_account_takeover","evidence_access_anomaly","manual_security_review"] as string[]).includes(input.reasonCode))return deny("unrecognized_reason");
  if(input.originalReviewerRef===input.independentReviewerRef||input.applicantRef===input.independentReviewerRef)return deny("conflict_of_interest");
  if(!input.applicantRequested||!input.consentToReview)return deny("missing_consent");
  if(input.legalHold)return deny("legal_hold");
  return deny("requires_authenticated_server");
}
export function previewAppealOutcome(language:AppealLanguage, decision:AppealDecision): Readonly<{subject:string;message:string;sent:false;status:"draft"}> {
 const es=language==="es";
 const outcome=es?
  {uphold:"La revisión independiente recomienda mantener la medida.",recommend_reinstatement:"La revisión independiente recomienda restablecer el acceso, sujeto a autorización segura.",needs_more_review:"La revisión independiente requiere más información por un canal seguro."}[decision]:
  {uphold:"Independent review recommends maintaining the measure.",recommend_reinstatement:"Independent review recommends restoring access, subject to secure authorization.",needs_more_review:"Independent review needs more information through a secure channel."}[decision];
 return {subject:es?"Borrador de revisión de apelación":"Appeal review draft",
 message:outcome+" "+(es?"Este es un borrador; no se ha enviado ninguna notificación. No envíes documentos de identidad por correo ni chat.":"This is a draft; no notice has been sent. Do not send identity documents by email or chat."),sent:false,status:"draft"};
}
