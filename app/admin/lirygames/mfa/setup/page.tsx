"use client";
import {useEffect,useRef,useState} from "react";
import {useRouter} from "next/navigation";
import {createSupabaseBrowserClient} from "../../../../../lib/supabase/browser";

export default function LiryGamesMfaSetupPage(){
  const router=useRouter();
  const[factorId,setFactorId]=useState("");
  const[qr,setQr]=useState("");
  const[secret,setSecret]=useState("");
  const[code,setCode]=useState("");
  const[message,setMessage]=useState("");
  const[messageType,setMessageType]=useState<"info"|"success"|"error">("info");
  const[busy,setBusy]=useState(false);
  const autoEnrollStarted=useRef(false);

  useEffect(()=>{
    (async()=>{
      const r=await fetch("/api/admin/mfa",{cache:"no-store"});
      const j=await r.json().catch(()=>({}));
      if(r.status===401){router.replace("/admin/lirygames/login");return;}
      if(!r.ok){setMessageType("error");setMessage("No fue posible comprobar la verificación en dos pasos.");return;}
      const totp=j.factors?.totp||[];
      const verified=totp.find((f:any)=>f.status==="verified"&&String(f.friendly_name||"").trim().toLowerCase()==="lirygames commander");
      if(verified){window.location.assign("/admin/lirygames/mfa");return;}
      if(!autoEnrollStarted.current){
        autoEnrollStarted.current=true;
        await enroll();
      }
    })();
  },[router]);

  async function enroll(){
    setBusy(true);setMessageType("info");setMessage("Generando QR exclusivo de LIRYGAMES…");
    try{
      const supabase=createSupabaseBrowserClient();
      const result=await supabase.auth.mfa.enroll({
        factorType:"totp",
        friendlyName:"LIRYGAMES Commander"
      });
      if(result.error){
        setMessageType("error");
        setMessage(result.error.message||"No fue posible generar el autenticador de LIRYGAMES.");
        return;
      }
      const factor=result.data;
      const qrCode=factor?.totp?.qr_code||"";
      const factorSecret=factor?.totp?.secret||"";
      if(!factor?.id||!qrCode){
        setMessageType("error");
        setMessage("Supabase no devolvió un código QR válido. Inténtalo nuevamente.");
        return;
      }
      setFactorId(factor.id);
      setQr(qrCode);
      setSecret(factorSecret);
      setMessageType("success");
      setMessage("QR generado. Escanéalo con tu aplicación autenticadora y confirma con el código temporal.");
    }catch{
      setMessageType("error");
      setMessage("No fue posible generar el QR. Revisa tu conexión e inténtalo nuevamente.");
    }finally{
      setBusy(false);
    }
  }

  async function verify(event:React.FormEvent){
    event.preventDefault();
    setBusy(true);setMessageType("info");setMessage("Verificando código…");
    try{
      const r=await fetch("/api/admin/lirygames/mfa/verify",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({factorId,code})
      });
      const j=await r.json().catch(()=>({}));
      if(!r.ok||!j.ok){setMessageType("error");setMessage("El código es incorrecto o ya venció.");return;}
      setMessageType("success");setMessage("Segundo factor configurado correctamente.");
      window.location.assign("/admin/master");
    }catch{
      setMessageType("error");setMessage("No fue posible completar la verificación.");
    }finally{
      setBusy(false);
    }
  }

  return <main className="authShell authShellLiry">
    <section className="authExperience">
      <div className="authStoryPanel">
        <div className="authBrandLockup">
          <span className="authLirySigil" aria-hidden="true"><i></i></span>
          <div><strong>LIRYGAMES</strong><span>SEGURIDAD DEL COMMANDER CENTER</span></div>
        </div>
        <div className="authStoryCopy">
          <div className="kicker">VERIFICACIÓN EN DOS PASOS</div>
          <h1>Protege el centro de mando.</h1>
          <p>Configura un segundo factor antes de administrar operaciones, datos y decisiones sensibles del estudio.</p>
        </div>
        <div className="authStoryFooter">LIRYGAMES STUDIOS · SEGURIDAD</div>
      </div>

      <section className="authCard authCardPremium">
        <div className="authCardMark"><span className="authLirySigil" aria-hidden="true"><i></i></span></div>
        <div className="kicker">SEGUNDO FACTOR</div>
        <h2>Configurar autenticador</h2>

        {!factorId&&<>
          <p className="lead">Estamos generando el autenticador exclusivo de LIRYGAMES. El código QR aparecerá automáticamente.</p>
          <button className="btn btnPrimary authSubmit" type="button" onClick={enroll} disabled={busy}>
            {busy?"Generando QR…":"Generar QR nuevamente"}
          </button>
        </>}

        {factorId&&<>
          {qr&&<div style={{background:"#fff",padding:12,borderRadius:12,margin:"12px auto",maxWidth:220}}>
            <img src={qr} alt="Código QR para configurar MFA" style={{display:"block",width:"100%",height:"auto"}}/>
          </div>}
          {secret&&<p className="note">Clave manual de respaldo: <code>{secret}</code></p>}
          <form className="authForm" onSubmit={verify}>
            <label><span>Código de verificación</span><input name="code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,8))}/></label>
            <button className="btn btnPrimary authSubmit" type="submit" disabled={busy||code.length<6}>{busy?"Verificando…":"Verificar y continuar"}</button>
          </form>
        </>}

        {message&&<p className={`note authStatus ${messageType}`} role="status" aria-live="polite">{message}</p>}
      </section>
    </section>
  </main>;
}
