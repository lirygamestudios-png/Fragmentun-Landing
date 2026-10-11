/** Preparación para denuncias. Sin escritura, sanciones ni procesamiento real. */
export type ReportReason="spam"|"harassment"|"impersonation"|"unsafe_content"|"other";
export type CommunityReportCandidate={contentId:string;reason:ReportReason;details:string};
const reasons=new Set<ReportReason>(["spam","harassment","impersonation","unsafe_content","other"]);
export function validateCommunityReport(value:unknown):value is CommunityReportCandidate{
 if(!value||typeof value!=="object"||Array.isArray(value))return false;
 const x=value as Record<string,unknown>;
 return typeof x.contentId==="string"&&/^[a-zA-Z0-9_-]{8,80}$/.test(x.contentId)&&
 typeof x.reason==="string"&&reasons.has(x.reason as ReportReason)&&
 typeof x.details==="string"&&x.details.length<=1000&&
 !/[\u0000-\u0008\u000b\u000e-\u001f]/.test(x.details);
}
export type ReportIntakeStatus="disabled"|"invalid";
export function inspectInactiveReport(value:unknown):ReportIntakeStatus{
 return validateCommunityReport(value)?"disabled":"invalid";
}
export function canBlockCommunityAccount():false{return false;}
