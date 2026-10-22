/** Preview-only exception classifier for Liry Developers. No database or side effects. */
export type DeveloperExceptionKind="missing_document"|"unreadable_document"|"expired_document"|"identity_mismatch"|"bank_beneficiary_mismatch"|"ip_ownership_dispute"|"suspected_fraud";
export type DeveloperExceptionPriority="routine"|"human_review"|"critical";
export type DeveloperExceptionRoute={priority:DeveloperExceptionPriority;owner:"applicant"|"document_reviewer"|"identity_reviewer"|"payout_reviewer"|"ip_reviewer"|"risk_team";autoApprove:false;messageKey:string};
const routes:Record<DeveloperExceptionKind,DeveloperExceptionRoute>={
 missing_document:{priority:"routine",owner:"applicant",autoApprove:false,messageKey:"request_missing_document"},
 unreadable_document:{priority:"routine",owner:"applicant",autoApprove:false,messageKey:"request_readable_copy"},
 expired_document:{priority:"routine",owner:"applicant",autoApprove:false,messageKey:"request_current_document"},
 identity_mismatch:{priority:"human_review",owner:"identity_reviewer",autoApprove:false,messageKey:"identity_review_required"},
 bank_beneficiary_mismatch:{priority:"human_review",owner:"payout_reviewer",autoApprove:false,messageKey:"bank_review_required"},
 ip_ownership_dispute:{priority:"human_review",owner:"ip_reviewer",autoApprove:false,messageKey:"rights_review_required"},
 suspected_fraud:{priority:"critical",owner:"risk_team",autoApprove:false,messageKey:"risk_review_required"}
};
export function classifyDeveloperException(kind:DeveloperExceptionKind):DeveloperExceptionRoute{
 return {...routes[kind]};
}
export const LIRY_DEVELOPER_EXCEPTION_AUTOMATION_ENABLED=false as const;
