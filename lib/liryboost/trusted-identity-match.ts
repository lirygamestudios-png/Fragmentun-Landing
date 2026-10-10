/** Contrato de vinculación de identidad, independiente del proveedor de autenticación. */
export type TrustedIdentity={userId:string;verifiedEmail:string;emailVerified:boolean};
export function matchesEnrollmentIdentity(identity:TrustedIdentity|null,participant:{userId:string;email:string}):boolean{
 if(!identity||!identity.emailVerified||!identity.userId.trim()||identity.userId!==identity.userId.trim()||!participant.userId.trim()||participant.userId!==participant.userId.trim())return false;
 if(identity.userId!==participant.userId)return false;
 const verified=identity.verifiedEmail.trim().toLowerCase();
 const entered=participant.email.trim().toLowerCase();
 return verified.length>0&&entered.length>0&&verified===entered;
}
