import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Offline erasure workflow specification only: no DB, vendor API, or deletions performed. */
export type ErasureStage="requested"|"identity_confirmed"|"privacy_review"|"legal_hold"|"approved"|"completed"|"denied";
export type ErasureAction="confirm_requester"|"begin_privacy_review"|"place_legal_hold"|"approve"|"deny"|"mark_completed";
export type ErasureRole="applicant"|"privacy_officer"|"authorized_executor";
export type ErasureCase=Readonly<{requestId:string;applicationId:string;stage:ErasureStage;requesterVerified:boolean;legalHold:boolean;policyVersion:string;reasonCode:string|null}>;
export type ErasureAssessment=Readonly<{permitted:false;reason:"service_disabled"|"invalid_request"|"unauthorized"|"legal_hold_active"|"invalid_transition"|"requires_secure_execution"}>;
const moves:Readonly<Record<ErasureStage,Partial<Record<ErasureAction,ErasureStage>>>>={
 requested:{confirm_requester:"identity_confirmed"},
 identity_confirmed:{begin_privacy_review:"privacy_review"},
 privacy_review:{place_legal_hold:"legal_hold",approve:"approved",deny:"denied"},
 legal_hold:{},approved:{mark_completed:"completed"},completed:{},denied:{}
};
export function assessErasureStep(record:ErasureCase,action:ErasureAction,role:ErasureRole):ErasureAssessment{
 if(biometricProviderStatus==="disabled")return {permitted:false,reason:"service_disabled"};
 if(!record.requestId||!record.applicationId||!record.policyVersion)return {permitted:false,reason:"invalid_request"};
 if(action==="confirm_requester"&&role!=="privacy_officer")return {permitted:false,reason:"unauthorized"};
 if(["begin_privacy_review","place_legal_hold","approve","deny"].includes(action)&&role!=="privacy_officer")return {permitted:false,reason:"unauthorized"};
 if(action==="mark_completed"&&role!=="authorized_executor")return {permitted:false,reason:"unauthorized"};
 if(record.legalHold&&(action==="approve"||action==="mark_completed"))return {permitted:false,reason:"legal_hold_active"};
 if(!moves[record.stage][action])return {permitted:false,reason:"invalid_transition"};
 return {permitted:false,reason:"requires_secure_execution"};
}
/** Production requires verified ownership, scoped deletion at processor, independent logs, retention review and legal sign-off. */
