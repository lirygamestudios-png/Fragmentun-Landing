/** Flujo documental de denuncias. No hay bandeja activa, usuarios ni sanciones. */
export type ReportReviewState="received"|"under_review"|"resolved"|"dismissed";
export type ReportReviewAction="start_review"|"resolve"|"dismiss";
export type ReportReviewContext={moderatorAuthorized:boolean;evidenceReviewed:boolean};
export function nextReportReviewState(state:ReportReviewState,action:ReportReviewAction,context:ReportReviewContext):ReportReviewState|null{
 if(!context.moderatorAuthorized)return null;
 if(state==="received"&&action==="start_review")return "under_review";
 if(state==="under_review"&&context.evidenceReviewed&&action==="resolve")return "resolved";
 if(state==="under_review"&&context.evidenceReviewed&&action==="dismiss")return "dismissed";
 return null;
}
export function canApplyModerationSanction():false{return false;}
