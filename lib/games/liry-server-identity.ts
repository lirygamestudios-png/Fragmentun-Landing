/** Frontera preparatoria de identidad pública LIRY ID.
 * Usar solo desde código servidor. Requiere verificador real de sesiones gamer.
 * Nunca habilita acceso por datos proporcionados por el navegador.
 */
import {reviewLiryPublicSession} from "./liry-public-session";
export type GamerSessionProof={userId:string;emailConfirmed:boolean;audience:string;expiresAt:number;verifiedByProvider:boolean};
export type GamerSessionVerifier={verifyCurrentSession:()=>Promise<GamerSessionProof|null>};
export async function reviewServerGamerSession(verifier:GamerSessionVerifier|null,now=Date.now()){
 if(!verifier)return {authorized:false,reason:"unverified" as const};
 try{
  const proof=await verifier.verifyCurrentSession();
  if(!proof)return {authorized:false,reason:"unverified" as const};
  return reviewLiryPublicSession({source:"trusted_server",userId:proof.userId,emailConfirmed:proof.emailConfirmed,sessionVerified:proof.verifiedByProvider,audience:proof.audience,expiresAt:proof.expiresAt},now);
 }catch{return {authorized:false,reason:"unverified" as const}}
}
