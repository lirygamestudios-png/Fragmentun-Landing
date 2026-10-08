"use client";
import {FormEvent,useState} from "react";

const ERROR_MESSAGES:Record<string,string>={
  invalid_mfa_input:"El código debe tener entre 6 y 8 dígitos.",
  mfa_challenge_failed:"No fue posible iniciar la verificación. Inténtalo nuevamente.",
  mfa_verify_failed:"El código es incorrecto o ya venció."
};

export function LiryGamesMfaVerifyForm({factorId}:{factorId:string}){
  const[code,setCode]=useState("");
  const[status,setStatus]=useState("");
  const[statusType,setStatusType]=useState<"info"|"success"|"error">("info");
  const[loading,setLoading]=useState(false);

  async function submit(event:FormEvent){
    event.preventDefault();
    if(code.length<6)return;
    setLoading(true);
    setStatusType("info");
    setStatus("Verificando código…");
    try{
      const r=await fetch("/api/admin/mfa",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({action:"verify",factorId,code})
      });
      const j=await r.json().catch(()=>({}));
      if(!r.ok||!j.ok){
        setStatusType("error");
        setStatus(ERROR_MESSAGES[j.error]||"No fue posible completar la verificación.");
        return;
      }
      setStatusType("success");
      setStatus("Verificación correcta. Abriendo Commander Center…");
      window.location.assign("/admin/master");
    }catch{
      setStatusType("error");
      setStatus("No fue posible conectar con el servicio de verificación. Revisa tu conexión e inténtalo nuevamente.");
    }finally{
      setLoading(false);
    }
  }

  return <>
    <form className="authForm" onSubmit={submit}>
      <label>
        <span>Código de verificación</span>
        <input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6,8}"
          minLength={6}
          maxLength={8}
          required
          autoFocus
          value={code}
          onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,8))}
        />
      </label>
      <button className="btn btnPrimary authSubmit" type="submit" disabled={loading||code.length<6}>
        {loading?"Verificando…":"Verificar y entrar"}
      </button>
    </form>
    {status&&<p className={`note authStatus ${statusType}`} role="status" aria-live="polite">{status}</p>}
  </>;
}
