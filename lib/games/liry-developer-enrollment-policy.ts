/** Future applicant-to-dossier association policy. No database writes or real enrollment. */
export const LIRY_DEVELOPER_ENROLLMENT_ENABLED=false as const;
export type ApplicantBindingRequest={
 authenticatedUserId:string;
 applicationId:string;
 ownerUserId:string;
 sessionVerified:boolean;
 serverOwnershipVerified:boolean;
 emailVerified:boolean;
};
export function canBindDeveloperApplication(req:ApplicantBindingRequest):boolean{
 return LIRY_DEVELOPER_ENROLLMENT_ENABLED&&
  req.sessionVerified&&req.serverOwnershipVerified&&req.emailVerified&&
  /^[a-zA-Z0-9_-]{6,100}$/.test(req.applicationId)&&
  req.authenticatedUserId.length>0&&req.authenticatedUserId===req.ownerUserId;
}
export function describeDeveloperEnrollmentRequirements(locale:"es"|"en"):readonly string[]{
 return locale==="es"?[
  "Cuenta autenticada y correo verificado",
  "Solicitud vinculada al usuario por comprobación del servidor",
  "Consentimientos y documentación por canal seguro",
  "Identidad y banco validados separadamente antes de habilitar operaciones"
 ]:[
  "Authenticated account and verified email",
  "Application linked to the user after server ownership verification",
  "Consent and documents via secure channel",
  "Identity and banking independently verified before transactions"
 ];
}
