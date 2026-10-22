import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Offline routing policy only. No real monitoring, notifications or privileged actions. */
export type EscalationTrigger="unconfirmed_erasure"|"legal_hold_conflict"|"invalid_identity_signature"|"cross_application_identity_event"|"unauthorized_access_attempt"|"overdue_privacy_request";
export type EscalationOwner="privacy_officer"|"authorized_security_reviewer"|"platform_admin";
export type EscalationLevel="routine"|"priority"|"critical";
export type EscalationRoute=Readonly<{trigger:EscalationTrigger;level:EscalationLevel;primary:EscalationOwner;oversight:EscalationOwner|null;requiresHumanReview:true;dispatched:false}>;
const routes:Readonly<Record<EscalationTrigger,Omit<EscalationRoute,"trigger"|"requiresHumanReview"|"dispatched">>>={
 unconfirmed_erasure:{level:"priority",primary:"privacy_officer",oversight:null},
 legal_hold_conflict:{level:"critical",primary:"privacy_officer",oversight:"platform_admin"},
 invalid_identity_signature:{level:"critical",primary:"authorized_security_reviewer",oversight:"platform_admin"},
 cross_application_identity_event:{level:"critical",primary:"authorized_security_reviewer",oversight:"platform_admin"},
 unauthorized_access_attempt:{level:"critical",primary:"authorized_security_reviewer",oversight:"platform_admin"},
 overdue_privacy_request:{level:"priority",primary:"privacy_officer",oversight:"platform_admin"}
};
export function previewIdentityEscalation(trigger:EscalationTrigger):EscalationRoute{
 void biometricProviderStatus;
 return {trigger,...routes[trigger],requiresHumanReview:true,dispatched:false};
}
/** Timeliness thresholds require a formally approved policy. An admin cannot override provider identity results. */
