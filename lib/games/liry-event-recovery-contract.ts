/** Modelo puro de recuperación; sin base de datos, red ni acreditación de XP. */
export type RecoveryOutcome="retry"|"reconcile"|"reject"|"quarantine";
export type EventFailure="network_timeout"|"unknown_commit"|"unauthorized"|"invalid_event"|"storage_unavailable";
const FAILURES=new Set<EventFailure>(["network_timeout","unknown_commit","unauthorized","invalid_event","storage_unavailable"]);
export function planInactiveEventRecovery(failure:EventFailure,attempts:number):RecoveryOutcome{
 if(!FAILURES.has(failure))return "quarantine";
 if(!Number.isSafeInteger(attempts)||attempts<0)return "quarantine";
 if(failure==="unauthorized"||failure==="invalid_event")return "reject";
 if(failure==="unknown_commit")return "reconcile";
 if(attempts>=3)return "quarantine";
 return "retry";
}
/** Información mínima de auditoría, sin contenido del evento ni datos personales. */
export type SafeEventAuditRecord={
 outcome:RecoveryOutcome;
 category:EventFailure;
 attempt:number;
 recordedAt:string;
};
export function prepareInactiveAuditRecord(
 failure:EventFailure,attempts:number,recordedAt:string
):SafeEventAuditRecord|null{
 if(!FAILURES.has(failure)||!Number.isSafeInteger(attempts)||attempts<0||attempts>100)return null;
 if(!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(recordedAt)||
 !Number.isFinite(Date.parse(recordedAt))||Date.parse(recordedAt)>Date.now())return null;
 return {outcome:planInactiveEventRecovery(failure,attempts),category:failure,attempt:attempts,recordedAt};
}
