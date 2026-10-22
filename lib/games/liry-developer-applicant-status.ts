import type {DeveloperDocumentStatus} from "./liry-developer-document-lifecycle";
import type {DeveloperReminderStatus} from "./liry-developer-reminder-tracking";

/** Server-side projection contract only; never accept a browser-provided applicant ID as authority. */
export type DeveloperApplicantStatusRecord={
 applicationId:string;
 ownerUserId:string;
 documentStatus:DeveloperDocumentStatus;
 reminderStatus:DeveloperReminderStatus;
 identityVerified:boolean;
 bankVerified:boolean;
 rightsApproved:boolean;
 admissionApproved:boolean;
};
export type DeveloperApplicantStatusView={
 documentStatus:DeveloperDocumentStatus;
 reminderStatus:DeveloperReminderStatus;
 identityVerified:boolean;
 bankVerified:boolean;
 rightsApproved:boolean;
 admissionApproved:boolean;
};
export const LIRY_DEVELOPER_LIVE_STATUS_ENABLED=false as const;
export function projectDeveloperApplicantStatus(
 record:DeveloperApplicantStatusRecord|null,
 access:{authenticatedUserId:string;sessionVerified:boolean;serverOwnershipVerified:boolean}
):DeveloperApplicantStatusView|null{
 if(!LIRY_DEVELOPER_LIVE_STATUS_ENABLED||!record||!access.sessionVerified||!access.serverOwnershipVerified||
  !access.authenticatedUserId||access.authenticatedUserId!==record.ownerUserId)return null;
 return {
  documentStatus:record.documentStatus,reminderStatus:record.reminderStatus,
  identityVerified:record.identityVerified,bankVerified:record.bankVerified,
  rightsApproved:record.rightsApproved,admissionApproved:record.admissionApproved
 };
}
