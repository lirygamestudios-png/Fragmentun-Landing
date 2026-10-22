import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Offline evidence authenticity contract; no keys, signing, storage, or provider operations. */
export type EvidenceAttestation=Readonly<{incidentRef:string;entryId:string;payloadDigest:string;signatureReference:string;signingKeyId:string;timestampTokenReference:string;signedAt:string;storageReceiptReference:string;retentionPolicyVersion:string;containsSensitiveData:false}>;
export type EvidenceAuthenticity=Readonly<{authenticated:false;reason:"service_disabled"|"incomplete_evidence"|"invalid_timestamp"|"requires_trusted_signature_and_storage_verification"}>;
const ref=/^[A-Za-z0-9_-]{8,128}$/;
export function assessEvidenceAuthenticity(record:EvidenceAttestation,nowMs:number):EvidenceAuthenticity{
 if(biometricProviderStatus==="disabled")return {authenticated:false,reason:"service_disabled"};
 if(!ref.test(record.incidentRef)||!ref.test(record.entryId)||!record.payloadDigest||!record.signatureReference||!record.signingKeyId||!record.timestampTokenReference||!record.storageReceiptReference||!record.retentionPolicyVersion)return {authenticated:false,reason:"incomplete_evidence"};
 const signed=Date.parse(record.signedAt);
 if(!Number.isFinite(nowMs)||!Number.isFinite(signed)||signed>nowMs)return {authenticated:false,reason:"invalid_timestamp"};
 return {authenticated:false,reason:"requires_trusted_signature_and_storage_verification"};
}
/** Real authenticity requires canonical payload hashing, authenticated signing keys, trusted timestamps, append-only retention and independent verification. */
