import {classifyDeveloperException,type DeveloperExceptionKind} from "./liry-developer-exception-routing";
import type {DeveloperDocumentStatus} from "./liry-developer-document-lifecycle";
export type DeveloperNotificationDraft={
 key:string;locale:"es"|"en";audience:"applicant"|"internal_review";
 subject:string;body:string;documentStatus:DeveloperDocumentStatus;requiresHumanReview:boolean;
};
export const LIRY_DEVELOPER_NOTIFICATIONS_ENABLED=false as const;
const messages={
 es:{
  request_missing_document:["Documento pendiente","Tu solicitud necesita un documento. Revisa los requisitos en tu panel."],
  request_readable_copy:["Documento ilegible","Se requiere una copia legible. Revisa tu panel."],
  request_current_document:["Documento vencido","Se requiere un documento vigente. Revisa tu panel."],
  identity_review_required:["Revisión de identidad","Tu identidad requiere una revisión adicional."],
  bank_review_required:["Revisión bancaria","La titularidad de la cuenta de pagos requiere revisión."],
  rights_review_required:["Revisión de derechos","La documentación de derechos requiere revisión adicional."],
  risk_review_required:["Revisión adicional","Tu solicitud está pendiente de revisión especializada."]
 },
 en:{
  request_missing_document:["Document required","Your application needs a document. Check your panel."],
  request_readable_copy:["Unreadable document","A readable copy is required. Check your panel."],
  request_current_document:["Expired document","A current document is required. Check your panel."],
  identity_review_required:["Identity review","Your identity requires additional review."],
  bank_review_required:["Bank review","Payout account ownership requires review."],
  rights_review_required:["Rights review","Rights documentation requires additional review."],
  risk_review_required:["Additional review","Your application is pending specialized review."]
 }
} as const;
export function prepareDeveloperNotification(kind:DeveloperExceptionKind,locale:"es"|"en"):DeveloperNotificationDraft{
 const route=classifyDeveloperException(kind);
 const [subject,body]=messages[locale][route.messageKey as keyof typeof messages.es];
 const routine=route.priority==="routine";
 return {key:route.messageKey,locale,audience:routine?"applicant":"internal_review",
  subject,body,documentStatus:routine?"correction_required":"under_review",
  requiresHumanReview:!routine};
}
// Deliberately no send(), email, network, persistence, PII or provider integration.
