import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Pure, fail-closed checklist. No provider endpoint is created or invoked. */
export type ProviderSecurityGates=Readonly<{
 providerContractApproved:boolean;
 jurisdictionalPrivacyReviewApproved:boolean;
 consentRecordedServerSide:boolean;
 authenticatedApplicant:boolean;
 authenticatedProviderSignature:boolean;
 trustedApplicationMatch:boolean;
 nonceAndTimestampValid:boolean;
 durableReplayCheckPassed:boolean;
 auditAndRetentionPolicyApproved:boolean;
}>;
export type ProviderAcceptance=Readonly<{accepted:false;reason:"integration_disabled"|"missing_security_gate"}>;
export function canAcceptBiometricResult(gates:ProviderSecurityGates):ProviderAcceptance{
 if(biometricProviderStatus==="disabled")return {accepted:false,reason:"integration_disabled"};
 const approved=Object.values(gates).every(value=>value===true);
 return approved?{accepted:false,reason:"integration_disabled"}:{accepted:false,reason:"missing_security_gate"};
}
/** Design guard only; no accepted:true path may be added without explicit activation,
 * vetted provider signatures, server authorization and audited persistence. */
