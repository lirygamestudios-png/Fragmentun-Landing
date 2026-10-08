import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { getMfaState } from "../../../lib/supabase/mfa";
import { AdminMfaVerifyForm } from "../../../components/AdminMfaVerifyForm";

export const dynamic="force-dynamic";

export default async function AdminMfaPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");

  const{data:profile}=await supabase
    .from("admin_profiles")
    .select("role,display_name")
    .eq("user_id",user.id)
    .maybeSingle();

  if(!profile) redirect("/admin/login?unauthorized=1");

  const state=await getMfaState(supabase);
  if(state.state==="satisfied") redirect("/admin");

  const factors=await supabase.auth.mfa.listFactors();
  const factor=(factors.data?.totp||[]).find((f:any)=>
    f.status==="verified"&&String(f.friendly_name||"").trim().toLowerCase()==="fragmentun admin"
  );

  if(!factor) redirect("/admin/mfa/setup");

  return <main className="authShell authShellFragmentun">
    <section className="authExperience">
      <div className="authStoryPanel">
        <div className="authBrandLockup">
          <img src="/fragmentun-mark.png" alt="" width="74" height="74"/>
          <div><strong>FRAGMENTUN</strong><span>SEGURIDAD DEL PANEL</span></div>
        </div>
        <div className="authStoryCopy">
          <div className="kicker">VERIFICACIÓN EN DOS PASOS</div>
          <h1>Confirma que realmente eres tú.</h1>
          <p>Introduce el código temporal de tu aplicación autenticadora para completar el acceso administrativo.</p>
        </div>
        <div className="authStoryFooter">JOSÉ LIRANZO · FRAGMENTUN</div>
      </div>

      <section className="authCard authCardPremium">
        <div className="authCardMark"><img src="/fragmentun-mark.png" alt="FRAGMENTUN" width="54" height="54"/></div>
        <div className="kicker">SEGUNDO FACTOR</div>
        <h2>Verificar segundo factor</h2>
        <p className="lead">Abre tu app autenticadora y escribe el código temporal.</p>

        <AdminMfaVerifyForm factorId={factor.id}/>

        <p className="note">Autenticador: {factor.friendly_name||"FRAGMENTUN Admin"}</p>
      </section>
    </section>
  </main>;
}
