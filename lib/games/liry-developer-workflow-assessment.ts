import {assessDeveloperExpiry} from "./liry-developer-expiry-advisory.ts";
import {simulateReminderPolicy} from "./liry-developer-reminder-policy.ts";
import type {DeveloperDocumentStatus} from "./liry-developer-document-lifecycle";
import type {DeveloperReminderStatus} from "./liry-developer-reminder-tracking";

/** Read-only coordination model; not a job runner and never sends or deletes. */
export const LIRY_DEVELOPER_WORKFLOW_EXECUTION_ENABLED=false as const;
export type DeveloperWorkflowAssessment={
 documentStatus:DeveloperDocumentStatus;
 reminderStatus:DeveloperReminderStatus;
 expiry:"policy_missing"|"invalid_date"|"not_due"|"upcoming"|"expired"|"legal_hold";
 nextAction:"none"|"request_correction"|"human_review"|"policy_review";
 maySend:false;mayApprove:false;mayDelete:false;
};
export function assessDeveloperWorkflow(input:{
 documentStatus:DeveloperDocumentStatus;reminderStatus:DeveloperReminderStatus;
 expiresAt:string|null;now:string;warningDays:number|null;legalHold:boolean;
 lastReminderAt:number|null;reminderCount:number;
}):DeveloperWorkflowAssessment{
 const expiry=assessDeveloperExpiry({expiresAt:input.expiresAt,now:input.now,warningDays:input.warningDays,legalHold:input.legalHold}).status;
 let nextAction:DeveloperWorkflowAssessment["nextAction"]="none";
 if(expiry==="policy_missing"||expiry==="invalid_date")nextAction="policy_review";
 else if(input.documentStatus==="rejected"||input.documentStatus==="under_review"||expiry==="legal_hold")nextAction="human_review";
 else if(input.documentStatus==="correction_required"||input.documentStatus==="expired"||expiry==="expired"||expiry==="upcoming"){
  const timestamp=Date.parse(input.now);
  if(Number.isFinite(timestamp)&&simulateReminderPolicy({now:timestamp,dueAt:timestamp,lastSentAt:input.lastReminderAt,sentCount:input.reminderCount}).eligible)
   nextAction="request_correction";
 }
 return {documentStatus:input.documentStatus,reminderStatus:input.reminderStatus,expiry,nextAction,maySend:false,mayApprove:false,mayDelete:false};
}
