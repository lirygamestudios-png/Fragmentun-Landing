import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../lib/supabase/server";
import {MasterSidebar} from "../../../components/MasterSidebar";
import styles from "./master-admin.module.css";

export default async function MasterAdminLayout({children}:{children:React.ReactNode}){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/login");

  const{data:profile}=await supabase.from("admin_profiles")
    .select("display_name,role")
    .eq("user_id",user.id)
    .maybeSingle();

  if(!profile)redirect("/admin/login?unauthorized=1");

  return <div className={styles.shell}>
    <MasterSidebar displayName={profile.display_name||"José Liranzo"} role={profile.role||"admin"}/>
    <div className={styles.masterContent}>{children}</div>
  </div>;
}
