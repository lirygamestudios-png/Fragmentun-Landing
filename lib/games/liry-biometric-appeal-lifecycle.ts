import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Pure offline policy model. Not a live appeals API or legal deadline determination. */
export type AppealCaseState="rejected"|"appeal_requested"|"under_human_review"|"additional_information_requested"|"resolved"|"closed";
export type AppealCaseAction="request_appeal"|"assign_reviewer"|"request_information"|"resume_review"|"record_resolution"|"close_case"|"reopen_case";
export type AppealActor="applicant"|"authorized_reviewer";
export type AppealCase=Readonly<{caseId:string;applicationId:string;state:AppealCaseState;reviewerId:string|null;createdAt:string;appealRequestedAt:string|null;resolvedAt:string|null;decisionReasonCode:string|null}>;
export type AppealPolicy=Readonly<{appealWindowDays:number;maxReopenings:number;policyVersion:string}>;
export type AppealAssessment=Readonly<{permitted:false;reason:"service_disabled"|"invalid_policy"|"invalid_case"|"outside_window"|"unauthorized"|"invalid_transition"|"requires_server_review"}>;
const identifier=/^[A-Za-z0-9_-]{8,128}$/;
const transitions:Readonly<Record<AppealCaseState,Partial<Record<AppealCaseAction,AppealCaseState>>>>={
 rejected:{request_appeal:"appeal_requested"},
 appeal_requested:{assign_reviewer:"under_human_review"},
 under_human_review:{request_information:"additional_information_requested",record_resolution:"resolved"},
 additional_information_requested:{resume_review:"under_human_review"},
 resolved:{close_case:"closed",reopen_case:"under_human_review"},
 closed:{reopen_case:"under_human_review"}
};
export function assessAppealCaseAction(record:AppealCase,action:AppealCaseAction,actor:AppealActor,policy:AppealPolicy,nowMs:number):AppealAssessment{
 if(biometricProviderStatus==="disabled")return {permitted:false,reason:"service_disabled"};
 if(!identifier.test(record.caseId)||!identifier.test(record.applicationId))return {permitted:false,reason:"invalid_case"};
 if(!Number.isInteger(policy.appealWindowDays)||policy.appealWindowDays<1||!Number.isInteger(policy.maxReopenings)||policy.maxReopenings<0||!policy.policyVersion)return {permitted:false,reason:"invalid_policy"};
 const start=Date.parse(record.resolvedAt??record.createdAt);
 if(!Number.isFinite(nowMs)||!Number.isFinite(start)||nowMs<start)return {permitted:false,reason:"invalid_case"};
 if(action==="request_appeal"&&nowMs-start>policy.appealWindowDays*86_400_000)return {permitted:false,reason:"outside_window"};
 if((action==="request_appeal")!==(actor==="applicant"))return {permitted:false,reason:"unauthorized"};
 if(!transitions[record.state][action])return {permitted:false,reason:"invalid_transition"};
 return {permitted:false,reason:"requires_server_review"};
}
/** Audit schema excludes images, ID numbers, face templates, and bank account details. */
export type AppealAuditEntry=Readonly<{caseId:string;applicationId:string;action:AppealCaseAction;actorRole:AppealActor;from:AppealCaseState;to:AppealCaseState;recordedAt:string;reasonCode:string;policyVersion:string}>;
/** Windows/reopening limits are proposals requiring future legal and business approval. */
