import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Offline consent policy model only: no biometric capture, no browser storage, no API. */
export type BiometricConsentRecord=Readonly<{
 applicationId:string;
 policyVersion:string;
 acceptedAt:string;
 expiresAt:string;
 identityPurposeAccepted:boolean;
 providerDisclosureAccepted:boolean;
 retentionDisclosureAccepted:boolean;
 alternativeRouteDisclosed:boolean;
 voluntaryChoiceRecorded:boolean;
}>;
export type ConsentCheck=Readonly<{eligible:false;reason:"integration_disabled"|"invalid_consent"|"expired_consent"}>;
const identifier=/^[A-Za-z0-9_-]{8,128}$/;
export function checkBiometricConsent(record:BiometricConsentRecord|null,nowMs:number,expectedApplicationId:string,expectedPolicyVersion:string):ConsentCheck{
 if(biometricProviderStatus==="disabled")return {eligible:false,reason:"integration_disabled"};
 if(!record||!identifier.test(expectedApplicationId)||record.applicationId!==expectedApplicationId||!expectedPolicyVersion||record.policyVersion!==expectedPolicyVersion)return {eligible:false,reason:"invalid_consent"};
 const accepted=Date.parse(record.acceptedAt),expires=Date.parse(record.expiresAt);
 if(!Number.isFinite(nowMs)||!Number.isFinite(accepted)||!Number.isFinite(expires)||accepted>nowMs||expires<=accepted||!record.identityPurposeAccepted||!record.providerDisclosureAccepted||!record.retentionDisclosureAccepted||!record.alternativeRouteDisclosed||!record.voluntaryChoiceRecorded)return {eligible:false,reason:"invalid_consent"};
 if(expires<=nowMs)return {eligible:false,reason:"expired_consent"};
 return {eligible:false,reason:"integration_disabled"};
}
/** This module intentionally has no successful activation path; future server authorization is separate. */
