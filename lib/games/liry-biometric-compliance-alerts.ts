import {biometricProviderStatus} from "./liry-biometric-readiness";
import type {PrivacyComplianceItem} from "./liry-biometric-privacy-compliance";
/** Preview-only privacy metrics: no live queries, notification delivery, or Commander Center wiring. */
export type ComplianceViewer="privacy_officer"|"authorized_security_reviewer"|"platform_admin"|"applicant";
export type ComplianceMetric="pending_requests"|"unconfirmed_erasure"|"legal_holds"|"invalid_records";
export type ComplianceAlert=Readonly<{category:ComplianceMetric;severity:"notice"|"review_required";count:number;audience:readonly ComplianceViewer[];dispatched:false}>;
export type ComplianceReport=Readonly<{enabled:false;metrics:Readonly<Record<ComplianceMetric,number>>;alerts:readonly ComplianceAlert[];containsPersonalData:false}>;
const audiences:Readonly<Record<ComplianceMetric,readonly ComplianceViewer[]>>={
 pending_requests:["privacy_officer"],unconfirmed_erasure:["privacy_officer","authorized_security_reviewer"],legal_holds:["privacy_officer"],invalid_records:["privacy_officer","authorized_security_reviewer"]
};
export function buildCompliancePreview(items:readonly PrivacyComplianceItem[],nowMs:number):ComplianceReport{
 const metrics:Record<ComplianceMetric,number>={pending_requests:0,unconfirmed_erasure:0,legal_holds:0,invalid_records:0};
 for(const item of items){
  if(item.stage==="requested"||item.stage==="under_review")metrics.pending_requests++;
  if(item.stage==="awaiting_processor"||item.stage==="confirmed"&&!item.processorConfirmed)metrics.unconfirmed_erasure++;
  if(item.legalHold||item.stage==="legal_hold")metrics.legal_holds++;
  if(!item.requestRef||!item.applicationRef||!Number.isFinite(Date.parse(item.receivedAt))||!Number.isFinite(nowMs))metrics.invalid_records++;
 }
 const alerts=(Object.keys(metrics) as ComplianceMetric[]).filter(k=>metrics[k]>0).map(k=>({category:k,severity:(k==="unconfirmed_erasure"||k==="invalid_records"?"review_required":"notice") as "notice"|"review_required",count:metrics[k],audience:audiences[k],dispatched:false as const}));
 void biometricProviderStatus;
 return {enabled:false,metrics,alerts,containsPersonalData:false};
}
export function previewAlertsForRole(report:ComplianceReport,role:ComplianceViewer):readonly ComplianceAlert[]{
 return report.alerts.filter(alert=>alert.audience.includes(role));
}
/** No record references in alert outputs; future live access requires server-side authentication and audit. */
