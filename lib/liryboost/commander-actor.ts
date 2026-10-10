import type {LiryBoostActor} from "./access-policy.ts";
/**
 * Adaptador de identidad autenticada para Commander Center.
 * El servidor debe validar sesión Supabase, admin_profiles y MFA del contexto
 * LIRYGAMES antes de entregar estos argumentos. El cliente nunca asigna roles.
 */
export function actorFromVerifiedCommanderSession(input:{
 userId:string|null;
 sessionVerified:boolean;
 commanderMfaVerified:boolean;
 trustedProfileRole:string|null;
}):LiryBoostActor{
 const id=input.userId?.trim()||null;
 if(!id||input.sessionVerified!==true||input.commanderMfaVerified!==true)
  return {authenticated:false,role:"anonymous",userId:null};
 const role=input.trustedProfileRole;
 if(role==="admin"||role==="owner")return {authenticated:true,role:"admin",userId:id};
 if(role==="verifier")return {authenticated:true,role:"verifier",userId:id};
 if(role==="participant")return {authenticated:true,role:"participant",userId:id};
 return {authenticated:false,role:"anonymous",userId:null};
}
