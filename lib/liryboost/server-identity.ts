/**
 * Resolución de identidad de LiryBoost exclusivamente en servidor.
 * No usa getSession() como prueba de autenticación; consulta getUser().
 * No crea cuentas, participantes, consentimientos ni sesiones.
 */
import "server-only";
import {createSupabaseServerClient} from "../supabase/server";

export type LiryBoostServerIdentity=
 | {authenticated:false;reason:"no_verified_user"}
 | {authenticated:true;userId:string};

export async function resolveLiryBoostAuthenticatedUser():Promise<LiryBoostServerIdentity>{
 try{
  const supabase=await createSupabaseServerClient();
  const {data,error}=await supabase.auth.getUser();
  const id=data?.user?.id;
  if(error||typeof id!=="string"||!id)return {authenticated:false,reason:"no_verified_user"};
  return {authenticated:true,userId:id};
 }catch{
  return {authenticated:false,reason:"no_verified_user"};
 }
}
