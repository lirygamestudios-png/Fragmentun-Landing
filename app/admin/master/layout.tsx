import {createHash} from "crypto";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../lib/supabase/server";
import {MasterSidebar} from "../../../components/MasterSidebar";
import styles from "./master-admin.module.css";

const CONTEXT="lirygames_commander";
const FACTOR_NAME="lirygames commander";

export default async function MasterAdminLayout({children}:{children:React.ReactNode}){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/lirygames/login");

  const{data:profile}=await supabase.from("admin_profiles")
    .select("display_name,role")
    .eq("user_id",user.id)
    .maybeSingle();

  if(!profile)redirect("/admin/lirygames/login?unauthorized=1");

  const cookieStore=await cookies();
  const contextToken=cookieStore.get("liry_mfa_context")?.value;
  if(!contextToken)redirect("/admin/lirygames/mfa");

  const tokenHash=createHash("sha256").update(contextToken).digest("hex");
  const{data:contextSession}=await supabase.from("admin_mfa_context_sessions")
    .select("factor_id,expires_at")
    .eq("user_id",user.id)
    .eq("context",CONTEXT)
    .eq("token_hash",tokenHash)
    .gt("expires_at",new Date().toISOString())
    .maybeSingle();

  if(!contextSession)redirect("/admin/lirygames/mfa");

  const factors=await supabase.auth.mfa.listFactors();
  const factor=(factors.data?.totp||[]).find((f:any)=>
    f.id===contextSession.factor_id&&
    f.status==="verified"&&
    String(f.friendly_name||"").trim().toLowerCase()===FACTOR_NAME
  );
  if(!factor)redirect("/admin/lirygames/mfa/setup");

  return <div className={styles.shell}>
    <MasterSidebar displayName={profile.display_name||"José Liranzo"} role={profile.role||"admin"}/>
    <div className={styles.masterContent}>{children}</div>
  </div>;
}
