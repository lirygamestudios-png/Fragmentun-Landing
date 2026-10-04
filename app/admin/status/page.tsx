import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { AdminSystemStatus } from "../../../components/AdminSystemStatus";

export default async function StatusPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/login");
  const{data:p}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(p?.role!=="admin")redirect("/admin");

  return <main className="adminMain">
    <div className="adminTopbar">
      <div><div className="kicker">Panel de administración</div><h1>Estado del sistema</h1></div>
      <Link className="btn btnGhost" href="/admin">← Inicio</Link>
    </div>
    <AdminSystemStatus/>
  </main>;
}
