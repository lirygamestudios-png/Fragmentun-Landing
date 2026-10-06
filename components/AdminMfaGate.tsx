"use client";
import {FormEvent,useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {createSupabaseBrowserClient} from "../lib/supabase/browser";

export function AdminMfaGate(){
  const router=useRouter();
  const[code,setCode]=useState("");
  const[status,setStatus]=useState("");
  const[loading,setLoading]=useState(false);
  const[factorId,setFactorId]=useState("");

  useEffect(()=>{
    (async()=>{
      const supabase=createSupabaseBrowserClient();
      const{data,error}=await supabase.auth.mfa.listFactors();
      if(error){setStatus("No fue posible comprobar la verificación en dos pasos.");return}
      const factor=data.totp.find(f=>f.status==="verified")||data.totp[0];
      if(!factor){setStatus("No se encontró un autenticador registrado.");return}
      setFactorId(factor.id);
    })();
  },[]);

  async function verify(e:FormEvent){
    e.preventDefault();
    if(!factorId||code.length<6)return;
    setLoading(true);setStatus("Verificando código…");
    const supabase=createSupabaseBrowserClient();
    const challenge=await supabase.auth.mfa.challenge({factorId});
    if(challenge.error){setLoading(false);setStatus("No fue posible iniciar la verificación.");return}
    const verified=await supabase.auth.mfa.verify({factorId,challengeId:challenge.data.id,code:code.trim()});
    if(verified.error){setLoading(false);setStatus("Código incorrecto o vencido.");return}
    setStatus("Verificación correcta. Abriendo el panel…");
    router.refresh();
  }

  return <main className="authShell authShellFragmentun">
    <section className="authExperience">
      <div className="authStoryPanel">
        <div className="authBrandLockup"><img src="/fragmentun-mark.png" alt="" width="74" height="74"/><div><strong>FRAGMENTUN</strong><span>SEGURIDAD DEL PANEL</span></div></div>
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
        <h2>Código de seguridad</h2>
        <p className="lead">Abre tu aplicación autenticadora e introduce el código de 6 dígitos.</p>
        <form onSubmit={verify} className="authForm">
          <label><span>Código temporal</span><input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={8} required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))}/></label>
          <button className="btn btnPrimary authSubmit" type="submit" disabled={loading||!factorId}>{loading?"Verificando…":"Verificar y entrar"}</button>
        </form>
        {status&&<p className="note authStatus" role="status">{status}</p>}
      </section>
    </section>
  </main>;
}
