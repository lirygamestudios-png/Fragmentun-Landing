"use client";
import {FormEvent,useEffect,useState} from "react";
import {createSupabaseBrowserClient} from "../lib/supabase/browser";

type Factor={id:string;friendly_name?:string;status?:string;factor_type?:string};

export function AdminSecurityMfa(){
  const[factors,setFactors]=useState<Factor[]>([]);
  const[qr,setQr]=useState("");
  const[secret,setSecret]=useState("");
  const[pendingId,setPendingId]=useState("");
  const[code,setCode]=useState("");
  const[status,setStatus]=useState("");
  const[busy,setBusy]=useState(false);
  const[aal,setAal]=useState("");

  async function load(){
    const supabase=createSupabaseBrowserClient();
    const[{data:f},{data:a}]=await Promise.all([
      supabase.auth.mfa.listFactors(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    ]);
    setFactors((f?.totp||[]) as Factor[]);
    setAal(a?.currentLevel||"aal1");
  }
  useEffect(()=>{load()},[]);

  async function start(){
    setBusy(true);setStatus("Preparando verificación…");
    const supabase=createSupabaseBrowserClient();
    for(const factor of factors.filter(x=>x.status!=="verified")){
      await supabase.auth.mfa.unenroll({factorId:factor.id}).catch(()=>{});
    }
    const{data,error}=await supabase.auth.mfa.enroll({factorType:"totp",friendlyName:"FRAGMENTUN Admin"});
    if(error){setBusy(false);setStatus("No fue posible iniciar la configuración.");return}
    setPendingId(data.id);setQr(data.totp.qr_code);setSecret(data.totp.secret);setStatus("Escanea el código QR y confirma con el código temporal.");setBusy(false);
  }

  async function confirm(e:FormEvent){
    e.preventDefault();if(!pendingId)return;
    setBusy(true);setStatus("Verificando…");
    const supabase=createSupabaseBrowserClient();
    const challenge=await supabase.auth.mfa.challenge({factorId:pendingId});
    if(challenge.error){setBusy(false);setStatus("No fue posible crear el desafío.");return}
    const verify=await supabase.auth.mfa.verify({factorId:pendingId,challengeId:challenge.data.id,code:code.trim()});
    if(verify.error){setBusy(false);setStatus("Código incorrecto o vencido.");return}
    setQr("");setSecret("");setPendingId("");setCode("");setStatus("Verificación en dos pasos activada correctamente.");setBusy(false);await load();
  }

  const verified=factors.filter(x=>x.status==="verified");

  return <div className="card adminSecondaryPanel">
    <div className="adminPanelHeader"><div><div className="kicker">Seguridad</div><h2>Verificación en dos pasos</h2></div><span className="adminPanelBadge">{verified.length?"ACTIVA":"OPCIONAL"}</span></div>
    <p className="note">Añade una segunda comprobación al acceso del Panel de administración mediante una aplicación autenticadora. Solo se vuelve obligatoria para tu cuenta después de completar y verificar el registro.</p>
    <div className="organicTrackingSummary">
      <div><span>Estado</span><strong>{verified.length?"Protegido con MFA":"Sin segundo factor"}</strong></div>
      <div><span>Nivel de sesión</span><strong>{aal==="aal2"?"AAL2 · reforzado":"AAL1 · contraseña"}</strong></div>
      <div><span>Factores verificados</span><strong>{verified.length}</strong></div>
    </div>
    {!verified.length&&!pendingId&&<div className="heroActions"><button className="btn btnPrimary" type="button" disabled={busy} onClick={start}>{busy?"Preparando…":"Configurar autenticador"}</button></div>}
    {pendingId&&<div className="card" style={{marginTop:18}}>
      <h3>1. Escanea este código</h3>
      {qr&&<img src={qr} alt="Código QR para configurar autenticador" style={{maxWidth:260,width:"100%",background:"#fff",padding:12,borderRadius:12}}/>}
      <p className="note">Si no puedes escanearlo, usa esta clave manual:</p>
      <p style={{wordBreak:"break-all"}}><strong>{secret}</strong></p>
      <form onSubmit={confirm} className="authForm" style={{marginTop:16}}>
        <label><span>2. Código de 6 dígitos</span><input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={8} required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))}/></label>
        <button className="btn btnPrimary" type="submit" disabled={busy}>{busy?"Verificando…":"Activar verificación"}</button>
      </form>
    </div>}
    {verified.length>0&&<p className="note" style={{marginTop:16}}>Tu cuenta ya tiene un autenticador verificado. En los próximos accesos, FRAGMENTUN exigirá el código temporal después de la contraseña.</p>}
    {status&&<p className="adminSaveFeedback" role="status">{status}</p>}
  </div>;
}
