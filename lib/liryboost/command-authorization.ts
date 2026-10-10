import type {LiryBoostActor,LiryBoostAction} from "./access-policy.ts";
import {canPerformLiryBoostAction} from "./access-policy.ts";
/**
 * Límite de autorización para futuros handlers del Commander Center.
 * No acepta role ni userId desde el cuerpo HTTP: actor se obtiene del verificador servidor.
 */
export async function authorizeLiryBoostCommand(
 loadActor:()=>Promise<LiryBoostActor>,
 action:LiryBoostAction,
 ownerUserId?:string
):Promise<boolean>{
 try{
  const actor=await loadActor();
  return canPerformLiryBoostAction(actor,action,ownerUserId);
 }catch{return false;}
}
