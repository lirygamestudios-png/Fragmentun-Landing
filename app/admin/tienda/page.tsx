import {redirect} from "next/navigation";
import Link from "next/link";
import {createSupabaseServerClient} from "../../../lib/supabase/server";
import {AdminShop} from "../../../components/AdminShop";
import {AdminCommerceOperations} from "../../../components/AdminCommerceOperations";
import {AdminCommerceManager} from "../../../components/AdminCommerceManager";

export default async function ShopPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/login");
  const{data:p}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!p||!["admin","editor","marketing"].includes(p.role))redirect("/admin");

  return <main className="adminMain">
    <div className="adminTopbar">
      <div><div className="kicker">Panel de administración</div><h1>Tienda FRAGMENTUN</h1></div>
      <Link className="btn btnGhost" href="/admin">← Inicio</Link>
    </div>
    {p.role==="admin"&&<><AdminCommerceOperations/><AdminCommerceManager/></>}
    <AdminShop/>
  </main>;
}
