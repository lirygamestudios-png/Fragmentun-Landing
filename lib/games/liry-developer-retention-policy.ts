/** Prospective Liry Developers retention matrix. Legal periods are deliberately unset.
 * No data processing, storage, deletion or scheduled jobs are enabled.
 */
export const LIRY_DEVELOPER_RETENTION_AUTOMATION_ENABLED=false as const;
export type DeveloperDataCategory="application_draft"|"identity_result"|"bank_statement"|"ip_evidence"|"audit_metadata";
export type RetentionDisposition="policy_review_required"|"eligible_for_deletion"|"legal_hold"|"retain";
export type RetentionInput={
 category:DeveloperDataCategory;
 createdAt:string;
 requestedDeletion:boolean;
 legalHold:boolean;
 approvedRetentionDays:number|null;
 now:string;
};
export function evaluateDeveloperRetention(input:RetentionInput):RetentionDisposition{
 if(input.legalHold)return"legal_hold";
 if(input.approvedRetentionDays===null||!Number.isSafeInteger(input.approvedRetentionDays)||input.approvedRetentionDays<0)return"policy_review_required";
 const created=Date.parse(input.createdAt),now=Date.parse(input.now);
 if(!Number.isFinite(created)||!Number.isFinite(now)||now<created)return"policy_review_required";
 if(input.requestedDeletion||now-created>=input.approvedRetentionDays*86400000)return"eligible_for_deletion";
 return"retain";
}
export const RETENTION_REQUIREMENTS:Readonly<Record<DeveloperDataCategory,string>>={
 application_draft:"Specify draft inactivity, withdrawal and deletion rules.",
 identity_result:"Use only minimum provider status/reference, subject to biometric privacy review.",
 bank_statement:"Minimize bank data and determine financial record retention before accepting documents.",
 ip_evidence:"Determine rights dispute and contractual retention separately.",
 audit_metadata:"Retain minimal event metadata according to documented audit and legal requirements."
};
