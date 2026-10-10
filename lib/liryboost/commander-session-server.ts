import "server-only";
import {cookies} from "next/headers";
import {createSupabaseServerClient} from "../supabase/server";
import {matchesLiryCommanderContext,type CommanderMfaRecord} from "./commander-mfa-context";
import {actorFromVerifiedCommanderSession} from "./commander-actor";
import type {LiryBoostActor} from "./access-policy";

const DENIED:LiryBoostActor={authenticated:false,role:"anonymous",userId:null};

/**
 * Comprobación de solo lectura para un futuro endpoint bajo /admin.
 * No modifica registros de Supabase ni activa funciones de LiryBoost.
 * Requiere sesión Auth, AAL2, rol del perfil y token MFA contextual vigente.
 */
export async function getVerifiedLiryBoostCommanderActor():Promise<LiryBoostActor>{
 try{
  const supabase=await createSupabaseServerClient();
  const {data:{user},error:userError}=await supabase.auth.getUser();
  if(userError||!user)return DENIED;
  const assurance=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if(assurance.error||assurance.data?.currentLevel!=="aal2")return DENIED;
  const cookie=(await cookies()).get("liry_mfa_context")?.value??null;
  if(!cookie)return DENIED;
  const [profile,context]=await Promise.all([
   supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle(),
   supabase.from("admin_mfa_context_sessions").select("user_id,context,token_hash,expires_at,factor_id").eq("user_id",user.id).eq("context","lirygames_commander").maybeSingle()
  ]);
  if(profile.error||context.error||!profile.data||!context.data)return DENIED;
  const valid=matchesLiryCommanderContext(context.data as CommanderMfaRecord,user.id,cookie);
  if(!valid)return DENIED;
  return actorFromVerifiedCommanderSession({userId:user.id,sessionVerified:true,commanderMfaVerified:true,trustedProfileRole:String(profile.data.role??"")});
 }catch{return DENIED;}
}
