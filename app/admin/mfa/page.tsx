import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { getMfaState } from "../../../lib/supabase/mfa";

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
  const verifiedTotp=(factors.data?.totp||[]).filter((f:any)=>f.status==="verified");

  if(!verifiedTotp.length) redirect("/admin/mfa/setup");

  const factor=verifiedTotp[0];

  return <main className="authShell authShellFragmentun">
    <section className="authExperience">
      <div className="authStoryPanel">
        <div className="authBrandLockup">
          <img src="/fragmentun-mark.png" alt="" width="74" height="74"/>
          <div><strong>LIRYGAMES STUDIOS</strong><span>SEGURIDAD ADMIN</span></div>
        </div>
        <div className="authStoryCopy">
          <div className="kicker">SEGUNDO FACTOR · TOTP</div>
          <h1>Verifica tu sesión administrativa.</h1>
          <p>Introduce el código temporal de tu autenticador para elevar esta sesión a AAL2.</p>
        </div>
        <div className="authStoryFooter">MASTER ADMIN · SECURITY GATE</div>
      </div>

      <section className="authCard authCardPremium">
        <div className="authCardMark"><img src="/fragmentun-mark.png" alt="LIRYGAMES" width="54" height="54"/></div>
        <div className="kicker">MFA</div>
        <h2>Verificar segundo factor</h2>
        <p className="lead">Abre tu app autenticadora y escribe el código temporal.</p>

        <form className="authForm" action="/admin/mfa/verify" method="post">
          <input type="hidden" name="factorId" value={factor.id}/>
          <label>
            <span>Código de verificación</span>
            <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" minLength={6} maxLength={8} required autoFocus/>
          </label>
          <button className="btn btnPrimary authSubmit" type="submit">Verificar MFA</button>
        </form>

        <p className="note">Factor: {factor.friendly_name||"LIRYGAMES Admin"}</p>
      </section>
    </section>
  </main>;
}
