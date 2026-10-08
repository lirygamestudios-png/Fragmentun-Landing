"use client";
import {FormEvent,useState} from "react";

const ERROR_MESSAGES:Record<string,string>={
  invalid_code:"El código debe tener entre 6 y 8 dígitos.",
  challenge_failed:"No fue posible iniciar la verificación. Inténtalo nuevamente.",
  verify_failed:"El código es incorrecto o ya venció.",
  aal2_not_set:"La verificación no pudo completarse. Inténtalo nuevamente."
};

export function AdminMfaVerifyForm({factorId}:{factorId:string}){
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
      const body=new FormData();
      body.set("factorId",factorId);
      body.set("code",code);
      const r=await fetch("/admin/mfa/verify",{method:"POST",body,redirect:"follow"});
      const url=new URL(r.url,window.location.origin);
      const error=url.searchParams.get("error");
      if(error){
        setStatusType("error");
        setStatus(ERROR_MESSAGES[error]||"No fue posible completar la verificación.");
        return;
      }
      setStatusType("success");
      setStatus("Verificación correcta. Abriendo el panel…");
      window.location.assign("/admin");
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
