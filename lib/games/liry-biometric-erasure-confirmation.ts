import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Offline specification only: no external processor calls, real deletion, persistence or receipts. */
export type ErasureSystem="lirygames_application"|"identity_provider"|"audit_register";
export type ErasureConfirmationStatus="not_requested"|"requested"|"processor_acknowledged"|"confirmed_deleted"|"retained_legal_hold"|"failed";
export type ErasureProcessorReceipt=Readonly<{requestId:string;applicationReference:string;system:ErasureSystem;status:ErasureConfirmationStatus;processorReceiptReference:string|null;confirmedAt:string|null;reasonCode:string|null;policyVersion:string}>;
export type ErasureConfirmation=Readonly<{complete:false;reason:"service_disabled"|"missing_processor_evidence"|"unconfirmed_processor"|"legal_hold"|"requires_authenticated_reconciliation"}>;
export function assessErasureConfirmation(receipts:readonly ErasureProcessorReceipt[],requestId:string):ErasureConfirmation{
 if(biometricProviderStatus==="disabled")return {complete:false,reason:"service_disabled"};
 const expected:readonly ErasureSystem[]=["lirygames_application","identity_provider","audit_register"];
 if(!requestId||receipts.length!==expected.length||expected.some(system=>receipts.filter(r=>r.system===system&&r.requestId===requestId).length!==1))return {complete:false,reason:"missing_processor_evidence"};
 if(receipts.some(r=>r.status==="retained_legal_hold"))return {complete:false,reason:"legal_hold"};
 if(receipts.some(r=>r.status!=="confirmed_deleted"||!r.processorReceiptReference||!r.confirmedAt))return {complete:false,reason:"unconfirmed_processor"};
 return {complete:false,reason:"requires_authenticated_reconciliation"};
}
/** A future service must independently authenticate processor evidence, limit audit retention and record reconciliation. */
