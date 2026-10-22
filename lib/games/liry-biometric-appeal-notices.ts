import {biometricProviderStatus} from "./liry-biometric-readiness";
/** Offline templates and safety requirements only. Never sends notifications or stores cases. */
export type AppealDecision="request_more_information"|"verification_confirmed"|"verification_not_confirmed"|"appeal_received";
export type AppealNotice=Readonly<{language:"es"|"en";decision:AppealDecision;subject:string;message:string;requiresHumanApproval:true;deliveryEnabled:false}>;
const templates:Readonly<Record<AppealDecision,Readonly<{es:[string,string];en:[string,string]}>>>={
 appeal_received:{es:["Apelación recibida","Tu solicitud será evaluada por personal autorizado. No implica aprobación ni inicio de una nueva captura biométrica."],en:["Appeal received","Your request will be reviewed by authorized staff. It does not mean approval or a new biometric capture."]},
 request_more_information:{es:["Información adicional requerida","Tu verificación requiere información adicional. Recibirás instrucciones seguras cuando este servicio esté disponible. No envíes documentos sensibles por correo ni chat."],en:["Additional information required","Your verification needs additional information. Secure instructions will be provided when available. Do not send sensitive documents by email or chat."]},
 verification_confirmed:{es:["Revisión de identidad completada","La revisión de identidad ha concluido favorablemente. La admisión de desarrolladores continúa sujeta a otras verificaciones y aprobación de LIRYGAMES."],en:["Identity review completed","The identity review is complete. Developer admission remains subject to other checks and LIRYGAMES approval."]},
 verification_not_confirmed:{es:["Revisión de identidad no confirmada","No fue posible confirmar la identidad en esta revisión. Puedes solicitar información sobre la vía de apelación o una alternativa accesible."],en:["Identity review not confirmed","Identity could not be confirmed in this review. You may ask about the appeal process or an accessible alternative."]}
};
export function previewAppealNotice(decision:AppealDecision,language:"es"|"en"):AppealNotice{
 const [subject,message]=templates[decision][language];
 void biometricProviderStatus;
 return {language,decision,subject,message,requiresHumanApproval:true,deliveryEnabled:false};
}
/** Future real messages require reviewer authentication, validated case ownership and approved privacy policies. */
