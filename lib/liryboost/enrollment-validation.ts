/** Validación pura para FUTURA inscripción. No almacena ni registra usuarios. */
export type LiryBoostEnrollmentDraft={alias:string;email:string;rulesAccepted:boolean;privacyAccepted:boolean};
export type EnrollmentValidation={valid:boolean;errors:string[]};
export function validateLiryBoostEnrollment(input:LiryBoostEnrollmentDraft):EnrollmentValidation{
 const errors:string[]=[];
 const alias=input.alias.trim();
 const email=input.email.trim();
 if(alias.length<3||alias.length>30||! /^[\p{L}\p{N} _.-]+$/u.test(alias))errors.push("invalid_alias");
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)errors.push("invalid_email");
 if(input.rulesAccepted!==true)errors.push("rules_required");
 if(input.privacyAccepted!==true)errors.push("privacy_required");
 return {valid:errors.length===0,errors};
}
