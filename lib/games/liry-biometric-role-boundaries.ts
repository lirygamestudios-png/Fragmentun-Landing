import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Offline role policy only; no endpoints, sessions or real status changes. */
export type IdentityActor="applicant"|"identity_provider"|"authorized_reviewer"|"platform_admin"|"system";
export type IdentityOperation="submit_application"|"provide_consent"|"request_appeal"|"submit_additional_information"|"report_provider_result"|"request_manual_review"|"record_manual_identity_decision"|"approve_developer"|"change_bank_beneficiary"|"override_provider_result";
export type IdentityAccessResult=Readonly<{allowed:false;reason:"integration_disabled"|"forbidden_operation"|"role_mismatch"}>;
const rolePermissions:Readonly<Record<IdentityActor,readonly IdentityOperation[]>>={
 applicant:["submit_application","provide_consent","request_appeal","submit_additional_information"],
 identity_provider:["report_provider_result"],
 authorized_reviewer:["request_manual_review","record_manual_identity_decision"],
 platform_admin:["approve_developer"],
 system:[]
};
const forbidden=new Set<IdentityOperation>(["override_provider_result","change_bank_beneficiary"]);
export function assessIdentityOperation(actor:IdentityActor,operation:IdentityOperation):IdentityAccessResult{
 if(biometricProviderStatus==="disabled")return {allowed:false,reason:"integration_disabled"};
 if(forbidden.has(operation))return {allowed:false,reason:"forbidden_operation"};
 if(!rolePermissions[actor].includes(operation))return {allowed:false,reason:"role_mismatch"};
 return {allowed:false,reason:"integration_disabled"};
}
/** Authentication, case ownership, signature validation and human approval are mandatory future server gates. */
