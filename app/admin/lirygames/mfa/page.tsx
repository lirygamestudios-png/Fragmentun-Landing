import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../../lib/supabase/server";
import {LiryGamesMfaVerifyForm} from "../../../../components/LiryGamesMfaVerifyForm";

export const dynamic="force-dynamic";

export default async function LiryGamesMfaPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/lirygames/login");

  const{data:profile}=await supabase.from("admin_profiles")
    .select("role,display_name")
    .eq("user_id",user.id)
    .maybeSingle();

  if(!profile)redirect("/admin/lirygames/login?unauthorized=1");

  const factors=await supabase.auth.mfa.listFactors();
  const factor=(factors.data?.totp||[]).find((f:any)=>
    f.status==="verified"&&String(f.friendly_name||"").trim().toLowerCase()==="lirygames commander"
  );
  if(!factor)redirect("/admin/lirygames/mfa/setup");

  return <main className="authShell authShellLiry">
    <section className="authExperience">
      <div className="authStoryPanel">
        <div className="authBrandLockup">
          <span className="authLirySigil" aria-hidden="true"><i></i></span>
          <div><strong>LIRYGAMES</strong><span>SEGURIDAD DEL COMMANDER CENTER</span></div>
        </div>
        <div className="authStoryCopy">
          <div className="kicker">VERIFICACIÓN EN DOS PASOS</div>
          <h1>Confirma tu identidad.</h1>
          <p>Introduce el código temporal de tu aplicación autenticadora para completar el acceso al Commander Center.</p>
        </div>
        <div className="authStoryFooter">LIRYGAMES STUDIOS · SEGURIDAD</div>
      </div>

      <section className="authCard authCardPremium">
        <div className="authCardMark"><span className="authLirySigil" aria-hidden="true"><i></i></span></div>
        <div className="kicker">SEGUNDO FACTOR</div>
        <h2>Verificar segundo factor</h2>
        <p className="lead">Abre tu app autenticadora y escribe el código temporal.</p>
        <LiryGamesMfaVerifyForm factorId={factor.id}/>
        <p className="note">Autenticador: {factor.friendly_name||"LIRYGAMES Commander"}</p>
      </section>
    </section>
  </main>;
}
