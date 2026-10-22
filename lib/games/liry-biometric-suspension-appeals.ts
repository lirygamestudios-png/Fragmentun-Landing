import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Offline suspension notice and independent appeal model. No messages, suspension or case writes. */
export type SuspensionAppealStage="suspension_proposed"|"notice_prepared"|"appeal_requested"|"independent_review"|"upheld"|"reinstatement_recommended"|"closed";
export type SuspensionAppealAction="prepare_notice"|"request_appeal"|"assign_independent_reviewer"|"uphold"|"recommend_reinstatement"|"close";
export type SuspensionAppealRole="authorized_security_reviewer"|"applicant"|"independent_appeals_reviewer"|"platform_admin";
export type SuspensionAppealCase=Readonly<{incidentRef:string;applicantRef:string;originalReviewerRef:string;appealsReviewerRef:string|null;stage:SuspensionAppealStage;reasonCode:string;noticeLanguage:"es"|"en";legalHold:boolean}>;
export type SuspensionAppealResult=Readonly<{allowed:false;noticeSent:false;accountSuspended:false;accessRestored:false;reason:"service_disabled"|"invalid_case"|"unauthorized"|"conflict_of_interest"|"invalid_transition"|"requires_authenticated_server"}>;
const transitions:Readonly<Record<SuspensionAppealStage,Partial<Record<SuspensionAppealAction,SuspensionAppealStage>>>>={
 suspension_proposed:{prepare_notice:"notice_prepared"},
 notice_prepared:{request_appeal:"appeal_requested"},
 appeal_requested:{assign_independent_reviewer:"independent_review"},
 independent_review:{uphold:"upheld",recommend_reinstatement:"reinstatement_recommended"},
 upheld:{close:"closed"},reinstatement_recommended:{close:"closed"},closed:{}
};
export function assessSuspensionAppeal(record:SuspensionAppealCase,action:SuspensionAppealAction,role:SuspensionAppealRole,actorRef:string):SuspensionAppealResult{
 const reject=(reason:SuspensionAppealResult["reason"]):SuspensionAppealResult=>({allowed:false,noticeSent:false,accountSuspended:false,accessRestored:false,reason});
 if(biometricProviderStatus==="disabled")return reject("service_disabled");
 if(!record.incidentRef||!record.applicantRef||!record.reasonCode||!actorRef)return reject("invalid_case");
 if(action==="request_appeal"&&(role!=="applicant"||actorRef!==record.applicantRef))return reject("unauthorized");
 if((action==="uphold"||action==="recommend_reinstatement"||action==="assign_independent_reviewer")&&role!=="independent_appeals_reviewer")return reject("unauthorized");
 if(role==="independent_appeals_reviewer"&&actorRef===record.originalReviewerRef)return reject("conflict_of_interest");
 if(!transitions[record.stage][action])return reject("invalid_transition");
 return reject("requires_authenticated_server");
}
/** Review notices must explain the reason, safe appeal path, and that identity documents must not be emailed. */
export function previewSuspensionNotice(language:"es"|"en"):{subject:string;message:string;sent:false}{
 return language==="es"?{subject:"Revisión preventiva de acceso",message:"Un acceso requiere revisión. Puedes solicitar una evaluación independiente. No envíes documentos de identidad por correo ni chat.",sent:false}:{subject:"Preventive access review",message:"An access issue requires review. You may request an independent appeal. Do not send identity documents by email or chat.",sent:false};
}
