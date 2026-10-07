"use client";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";

type Factor={id:string;friendly_name?:string|null;status?:string;factor_type?:string};

export default function AdminMfaPage(){
  const router=useRouter();
  const[state,setState]=useState<"loading"|"enroll"|"challenge"|"satisfied"|"error">("loading");
  const[factors,setFactors]=useState<Factor[]>([]);
  const[factorId,setFactorId]=useState("");
  const[qr,setQr]=useState("");
  const[secret,setSecret]=useState("");
  const[code,setCode]=useState("");
  const[message,setMessage]=useState("");
  const[busy,setBusy]=useState(false);

  async function load(){
    const r=await fetch("/api/admin/mfa",{cache:"no-store"});
    const j=await r.json().catch(()=>({}));
    if(r.status===401){router.replace("/admin/login");return;}
    if(!r.ok){setState("error");setMessage("No se pudo verificar el estado MFA.");return;}
    if(j.state==="satisfied"){setState("satisfied");return;}
    const totp:Array<Factor>=j.factors?.totp||[];
    setFactors(totp);
    if(j.state==="challenge"&&totp.length){
      setFactorId(totp[0].id);
      setState("challenge");
      return;
    }
    setState("enroll");
  }

  useEffect(()=>{void load();},[]);

  async function enroll(){
    setBusy(true);setMessage("");
    const r=await fetch("/api/admin/mfa",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"enroll",friendlyName:"LIRYGAMES Admin"})
    });
    const j=await r.json().catch(()=>({}));
    setBusy(false);
    if(!r.ok){setMessage(j.detail||"No se pudo iniciar MFA.");return;}
    setFactorId(j.factorId);
    setQr(j.qrCode||"");
    setSecret(j.secret||"");
    setState("challenge");
  }

  async function verify(){
    if(!factorId||!code.trim())return;
    setBusy(true);setMessage("");
    const r=await fetch("/api/admin/mfa",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"verify",factorId,code})
    });
    const j=await r.json().catch(()=>({}));
    setBusy(false);
    if(!r.ok||!j.ok){setMessage(j.detail||"Código no válido. Inténtalo nuevamente.");return;}
    setState("satisfied");
    setMessage("MFA verificado correctamente.");
    router.replace("/admin");
    router.refresh();
  }

  return <main className="authShell authShellFragmentun">
    <section className="authExperience">
      <div className="authStoryPanel">
        <div className="authBrandLockup">
          <img src="/fragmentun-mark.png" alt="" width="74" height="74"/>
          <div><strong>LIRYGAMES STUDIOS</strong><span>SEGURIDAD ADMIN</span></div>
        </div>
        <div className="authStoryCopy">
          <div className="kicker">SEGUNDO FACTOR · TOTP</div>
          <h1>Protección reforzada para acciones sensibles.</h1>
          <p>Los cambios de release, comercio, configuración y diagnóstico avanzado exigen una sesión AAL2 verificada.</p>
        </div>
        <div className="authStoryFooter">MASTER ADMIN · SECURITY GATE</div>
      </div>

      <section className="authCard authCardPremium">
        <div className="authCardMark"><img src="/fragmentun-mark.png" alt="LIRYGAMES" width="54" height="54"/></div>
        <div className="kicker">MFA</div>
        <h2>{state==="enroll"?"Configurar autenticador":"Verificar segundo factor"}</h2>

        {state==="loading"&&<p className="lead">Comprobando seguridad de la sesión…</p>}
        {state==="error"&&<div className="formNotice">{message}</div>}

        {state==="enroll"&&<>
          <p className="lead">Configura una app autenticadora antes de usar las funciones administrativas sensibles.</p>
          <button className="btn btnPrimary authSubmit" type="button" onClick={enroll} disabled={busy}>
            {busy?"Preparando…":"Configurar MFA"}
          </button>
        </>}

        {state==="challenge"&&<>
          {qr&&<div style={{background:"#fff",padding:12,borderRadius:12,margin:"12px auto",maxWidth:220}}>
            <img src={qr} alt="Código QR para configurar MFA" style={{display:"block",width:"100%",height:"auto"}}/>
          </div>}
          {secret&&<p className="note">Clave manual: <code>{secret}</code></p>}
          {!qr&&factors.length>0&&<p className="lead">Abre tu app autenticadora y escribe el código temporal.</p>}
          <div className="authForm">
            <label><span>Código de verificación</span><input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,8))}/></label>
            <button className="btn btnPrimary authSubmit" type="button" onClick={verify} disabled={busy||code.length<6}>
              {busy?"Verificando…":"Verificar MFA"}
            </button>
          </div>
        </>}

        {state==="satisfied"&&<>
          <p className="lead">Segundo factor verificado. Tu sesión cumple AAL2.</p>
          <button className="btn btnPrimary authSubmit" type="button" onClick={()=>router.replace("/admin")}>Continuar al panel</button>
        </>}

        {message&&state!=="error"&&<p className="note authStatus" role="status">{message}</p>}
      </section>
    </section>
  </main>;
}
