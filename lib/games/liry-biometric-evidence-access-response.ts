import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Offline response policy: never suspends accounts, resets grants, sends alerts, or stores incidents. */
export type AccessResponseStage="reported"|"under_human_review"|"suspension_recommended"|"recovery_review"|"resolved"|"dismissed";
export type AccessResponseAction="begin_review"|"recommend_suspension"|"request_recovery"|"approve_recovery"|"resolve"|"dismiss";
export type AccessResponseRole="authorized_security_reviewer"|"privacy_officer"|"platform_admin"|"applicant";
export type AccessResponseCase=Readonly<{incidentRef:string;grantRef:string;stage:AccessResponseStage;reviewerRef:string|null;approverRef:string|null;reasonCode:string;legalHold:boolean}>;
export type AccessResponseDecision=Readonly<{permitted:false;suspended:false;recovered:false;recorded:false;reason:"service_disabled"|"invalid_case"|"unauthorized"|"separation_of_duties"|"legal_hold_review"|"invalid_transition"|"requires_secure_server"}>;
const transitions:Readonly<Record<AccessResponseStage,Partial<Record<AccessResponseAction,AccessResponseStage>>>>={
 reported:{begin_review:"under_human_review"},
 under_human_review:{recommend_suspension:"suspension_recommended",dismiss:"dismissed"},
 suspension_recommended:{request_recovery:"recovery_review",resolve:"resolved"},
 recovery_review:{approve_recovery:"resolved",dismiss:"dismissed"},
 resolved:{},dismissed:{}
};
export function assessAccessIncidentResponse(record:AccessResponseCase,action:AccessResponseAction,role:AccessResponseRole,actingRef:string):AccessResponseDecision{
 const reject=(reason:AccessResponseDecision["reason"]):AccessResponseDecision=>({permitted:false,suspended:false,recovered:false,recorded:false,reason});
 if(biometricProviderStatus==="disabled")return reject("service_disabled");
 if(!record.incidentRef||!record.grantRef||!record.reasonCode||!actingRef)return reject("invalid_case");
 if(role!=="authorized_security_reviewer"&&role!=="privacy_officer"&&role!=="platform_admin")return reject("unauthorized");
 if(action==="approve_recovery"&&(role!=="platform_admin"||record.reviewerRef===actingRef))return reject("separation_of_duties");
 if(action==="recommend_suspension"&&role!=="authorized_security_reviewer")return reject("unauthorized");
 if(record.legalHold&&action==="approve_recovery")return reject("legal_hold_review");
 if(!transitions[record.stage][action])return reject("invalid_transition");
 return reject("requires_secure_server");
}
/** Production needs authenticated users, independent authorization, atomic revocation, tamper-evident decisions and safe appeal paths. */
