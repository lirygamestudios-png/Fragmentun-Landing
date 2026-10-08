"use client";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminMfaSetupPage(){
  const router=useRouter();
  const[factorId,setFactorId]=useState("");
  const[qr,setQr]=useState("");
  const[secret,setSecret]=useState("");
  const[code,setCode]=useState("");
  const[message,setMessage]=useState("");
  const[messageType,setMessageType]=useState<"info"|"success"|"error">("info");
  const[busy,setBusy]=useState(false);

  useEffect(()=>{
    (async()=>{
      const r=await fetch("/api/admin/mfa",{cache:"no-store"});
      const j=await r.json().catch(()=>({}));
      if(r.status===401){router.replace("/admin/login");return;}
      if(!r.ok){setMessageType("error");setMessage("No fue posible comprobar la verificación en dos pasos.");return;}
      if(j.state==="satisfied"){window.location.assign("/admin");return;}
      const totp=j.factors?.totp||[];
      const verified=totp.find((f:any)=>f.status==="verified"&&String(f.friendly_name||"").trim().toLowerCase()==="fragmentun admin");
      if(verified){window.location.assign("/admin/mfa");return;}
    })();
  },[]);

  async function enroll(){
    setBusy(true);setMessageType("info");setMessage("Preparando autenticador…");
    try{
      const r=await fetch("/api/admin/mfa",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({action:"enroll",friendlyName:"FRAGMENTUN Admin"})
      });
      const j=await r.json().catch(()=>({}));
      if(!r.ok){setMessageType("error");setMessage(j.detail||"No fue posible iniciar la verificación en dos pasos.");return;}
      setFactorId(j.factorId);setQr(j.qrCode||"");setSecret(j.secret||"");
      setMessageType("success");
      setMessage("Autenticador preparado. Escanea el código y confirma con tu código temporal.");
    }catch{
      setMessageType("error");
      setMessage("No fue posible conectar con el servicio de seguridad. Revisa tu conexión e inténtalo nuevamente.");
    }finally{
      setBusy(false);
    }
  }

  return <main className="authShell authShellFragmentun">
    <section className="authExperience">
      <div className="authStoryPanel">
        <div className="authBrandLockup">
          <img src="/fragmentun-mark.png" alt="" width="74" height="74"/>
          <div><strong>FRAGMENTUN</strong><span>SEGURIDAD DEL PANEL</span></div>
        </div>
        <div className="authStoryCopy">
          <div className="kicker">VERIFICACIÓN EN DOS PASOS</div>
          <h1>Protege tu acceso administrativo.</h1>
          <p>Este paso solo se requiere cuando tu cuenta todavía no tiene un segundo factor configurado.</p>
        </div>
        <div className="authStoryFooter">JOSÉ LIRANZO · FRAGMENTUN</div>
      </div>

      <section className="authCard authCardPremium">
        <div className="authCardMark"><img src="/fragmentun-mark.png" alt="FRAGMENTUN" width="54" height="54"/></div>
        <div className="kicker">SEGUNDO FACTOR</div>
        <h2>Configurar autenticador</h2>

        {!factorId&&<>
          <p className="lead">Pulsa el botón para preparar tu autenticador y generar el código QR.</p>
          <button className="btn btnPrimary authSubmit" type="button" onClick={enroll} disabled={busy}>
            {busy?"Preparando…":"Configurar segundo factor"}
          </button>
        </>}

        {factorId&&<>
          {qr&&<div style={{background:"#fff",padding:12,borderRadius:12,margin:"12px auto",maxWidth:220}}>
            <img src={qr} alt="Código QR para configurar MFA" style={{display:"block",width:"100%",height:"auto"}}/>
          </div>}
          {secret&&<p className="note">Clave manual de respaldo: <code>{secret}</code></p>}
          <form className="authForm" action="/admin/mfa/verify" method="post">
            <input type="hidden" name="factorId" value={factorId}/>
            <label><span>Código de verificación</span><input name="code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,8))}/></label>
            <button className="btn btnPrimary authSubmit" type="submit" disabled={code.length<6}>Verificar y continuar</button>
          </form>
        </>}

        {message&&<p className={`note authStatus ${messageType}`} role="status" aria-live="polite">{message}</p>}
      </section>
    </section>
  </main>;
}
