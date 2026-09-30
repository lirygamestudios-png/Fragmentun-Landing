import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { AdminContentEditor } from "../../../components/AdminContentEditor";

export default async function AdminContenidoPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor"].includes(profile.role))redirect("/admin");

  return <main className="adminMain">
    <div className="adminTopbar">
      <div><div className="kicker">Control Center</div><h1>Contenido Web</h1></div>
      <Link className="btn btnGhost" href="/admin">← Dashboard</Link>
    </div>
    <p className="lead">Edita el contenido bilingüe que alimenta la web pública. Los cambios publicados se reflejan desde Supabase.</p>
    <AdminContentEditor/>
  </main>;
}
