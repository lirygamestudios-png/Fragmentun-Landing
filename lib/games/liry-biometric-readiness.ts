/** Provider-agnostic biometric onboarding policy. No network calls or personal data. */
export const biometricProviderStatus = "disabled" as const;
export type IdentityDecision = "not_started" | "pending" | "verified" | "needs_review" | "rejected" | "expired";
export type DeveloperApproval = "not_submitted" | "under_review" | "approved" | "rejected";
export type IdentityVerificationSummary = Readonly<{
  applicationId: string;
  providerReference: string;
  decision: IdentityDecision;
  expiresAt: string | null;
  verifiedAt: string | null;
}>;
export type AdmissionGates = Readonly<{
  identity: IdentityDecision;
  intellectualPropertyApproved: boolean;
  bankBeneficiaryVerified: boolean;
  ageAndSafetyReviewed: boolean;
  manualDeveloperApproval: boolean;
}>;
/** A positive identity response cannot itself approve onboarding or a game. */
export function mayApproveDeveloper(gates: AdmissionGates): boolean {
  return gates.identity === "verified" &&
    gates.intellectualPropertyApproved &&
    gates.bankBeneficiaryVerified &&
    gates.ageAndSafetyReviewed &&
    gates.manualDeveloperApproval;
}
/** Only allowlisted decisions can become non-sensitive application metadata. */
export function isIdentityDecision(value: unknown): value is IdentityDecision {
  return typeof value === "string" &&
    ["not_started","pending","verified","needs_review","rejected","expired"].includes(value);
}
/**
 * Future integration requirements (NOT IMPLEMENTED):
 * - Initiate provider session only in authenticated server code with verified applicant
 *   authorization, explicit consent and a short-lived nonce.
 * - Never issue provider secret keys or reusable tokens to the browser.
 * - Authenticate provider webhooks via verified signature and event timestamps; prevent
 *   replay and cross-application linkage; reject expired sessions.
 * - Persist only an allowlisted result and a reference, not ID scans, selfie frames or templates.
 * - Run jurisdiction-specific privacy, retention, deletion and non-biometric fallback reviews
 *   before enabling this integration. Fail closed while providerStatus is disabled.
 */
