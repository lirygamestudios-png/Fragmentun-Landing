/**
 * Frontera de datos de LiryBoost para el Commander Center.
 * Solo lectura; sin acceso a Supabase ni activación automática.
 * Un proveedor futuro deberá validar autorización del servidor, consentimiento
 * vigente, invitaciones verificadas y exclusividad de invitado antes de entregar filas.
 */
import type {LiryBoostPublicationState} from "./public-snapshot.ts";
import type {VerifiedPublicListingEntry} from "./consent-current-top10.ts";
import {prepareRevocationSafeTop10} from "./revocation-safe-top10.ts";
import type {PublicLiryBoostRow} from "./public-leaderboard.ts";
export type LiryBoostReadProvider={
 readPublicationState:()=>Promise<LiryBoostPublicationState>;
 readAuthorizedVerifiedEntries:()=>Promise<ReadonlyArray<VerifiedPublicListingEntry>>;
 /** Revocaciones leídas dentro de la misma instantánea consistente. */
 readRevokedParticipantIds:()=>Promise<ReadonlyArray<string>>;
 readSnapshotConsistency:()=>Promise<boolean>;
};
export async function readLiryBoostTop10(provider:LiryBoostReadProvider|null):Promise<{
 programActive:boolean;leaderboard:ReadonlyArray<PublicLiryBoostRow>;
}>{
 if(!provider)return {programActive:false,leaderboard:[]};
 try{
  const state=await provider.readPublicationState();
  if(state.programActive!==true||state.rulesPublished!==true||state.verificationEnabled!==true)
   return {programActive:false,leaderboard:[]};
  const entries=await provider.readAuthorizedVerifiedEntries();
  if(!Array.isArray(entries))return {programActive:false,leaderboard:[]};
  const [revoked,consistent]=await Promise.all([provider.readRevokedParticipantIds(),provider.readSnapshotConsistency()]);
  if(!Array.isArray(revoked)||consistent!==true)return {programActive:false,leaderboard:[]};
  return {programActive:true,leaderboard:prepareRevocationSafeTop10(entries,revoked,consistent,true)};
 }catch{
  // Cualquier fallo se cierra sin revelar datos.
  return {programActive:false,leaderboard:[]};
 }
}
