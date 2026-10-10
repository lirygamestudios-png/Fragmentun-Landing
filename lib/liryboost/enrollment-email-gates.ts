/** Contrato puro para futura verificación de correo, sin envíos ni escrituras. */
export type EnrollmentIdentityState={
 emailVerified:boolean;
 verifiedEmail:string|null;
 submittedEmail:string;
 existingAccountUserId:string|null;
 currentUserId:string|null;
};
export function canFinalizeLiryBoostEnrollment(state:EnrollmentIdentityState):boolean{
 const submitted=state.submittedEmail.trim().toLowerCase();
 const verified=state.verifiedEmail?.trim().toLowerCase();
 if(!state.emailVerified||!submitted||!verified||submitted!==verified)return false;
 if(state.existingAccountUserId&&state.existingAccountUserId!==state.currentUserId)return false;
 return true;
}
/** El bloqueo de duplicados real requiere índice UNIQUE y transacción en DB. */
