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
  const[busy,setBusy]=useState(false);

  useEffect(()=>{
    (async()=>{
      const r=await fetch("/api/admin/mfa",{cache:"no-store"});
      const j=await r.json().catch(()=>({}));
      if(r.status===401){router.replace("/admin/login");return;}
      if(!r.ok){setMessage("No se pudo verificar el estado MFA.");return;}
      if(j.state==="satisfied"){window.location.assign("/admin");return;}
      const totp=j.factors?.totp||[];
      const verified=totp.find((f:any)=>f.status==="verified");
      if(verified){window.location.assign("/admin/mfa");return;}
    })();
  },[]);

  async function enroll(){
    setBusy(true);setMessage("");
    const r=await fetch("/api/admin/mfa",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"enroll",friendlyName:"LIRYGAMES Admin"})
    });
    const j=await r.json().catch(()=>({}));
    setBusy(false);
    if(!r.ok){setMessage(j.detail||"No se pudo iniciar MFA.");return;}
    setFactorId(j.factorId);setQr(j.qrCode||"");setSecret(j.secret||"");
  }

  return <main className="authShell authShellFragmentun">
    <section className="authExperience">
      <div className="authStoryPanel">
        <div className="authBrandLockup">
          <img src="/fragmentun-mark.png" alt="" width="74" height="74"/>
          <div><strong>LIRYGAMES STUDIOS</strong><span>SEGURIDAD ADMIN</span></div>
        </div>
        <div className="authStoryCopy">
          <div className="kicker">CONFIGURACIÓN MFA</div>
          <h1>Activa tu autenticador TOTP.</h1>
          <p>Este paso solo se requiere cuando la cuenta aún no tiene un segundo factor verificado.</p>
        </div>
        <div className="authStoryFooter">MASTER ADMIN · SECURITY SETUP</div>
      </div>

      <section className="authCard authCardPremium">
        <div className="authCardMark"><img src="/fragmentun-mark.png" alt="LIRYGAMES" width="54" height="54"/></div>
        <div className="kicker">MFA SETUP</div>
        <h2>Configurar autenticador</h2>

        {!factorId&&<>
          <p className="lead">Pulsa el botón para generar el QR de enrolamiento.</p>
          <button className="btn btnPrimary authSubmit" type="button" onClick={enroll} disabled={busy}>
            {busy?"Preparando…":"Configurar MFA"}
          </button>
        </>}

        {factorId&&<>
          {qr&&<div style={{background:"#fff",padding:12,borderRadius:12,margin:"12px auto",maxWidth:220}}>
            <img src={qr} alt="Código QR para configurar MFA" style={{display:"block",width:"100%",height:"auto"}}/>
          </div>}
          {secret&&<p className="note">Clave manual: <code>{secret}</code></p>}
          <form className="authForm" action="/admin/mfa/verify" method="post">
            <input type="hidden" name="factorId" value={factorId}/>
            <label><span>Código de verificación</span><input name="code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,8))}/></label>
            <button className="btn btnPrimary authSubmit" type="submit" disabled={code.length<6}>Verificar MFA</button>
          </form>
        </>}

        {message&&<p className="note authStatus" role="status">{message}</p>}
      </section>
    </section>
  </main>;
}
