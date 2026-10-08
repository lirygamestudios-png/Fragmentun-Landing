"use client";
import Link from "next/link";
import { FormEvent,useState } from "react";

export default function ForgotPasswordPage(){
  const[email,setEmail]=useState("");
  const[status,setStatus]=useState("");
  const[statusType,setStatusType]=useState<"info"|"success"|"error">("info");
  const[loading,setLoading]=useState(false);

  async function submit(event:FormEvent){
    event.preventDefault();
    setLoading(true);
    setStatusType("info");
    setStatus("Enviando enlace seguro…");
    try{
      const r=await fetch("/api/auth/forgot-password",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email})
      });
      if(!r.ok)throw new Error("request_failed");
      setStatusType("success");
      setStatus("Si existe una cuenta asociada a ese correo, recibirás un enlace seguro para restablecer la contraseña.");
    }catch{
      setStatusType("error");
      setStatus("No fue posible enviar la solicitud. Revisa tu conexión e inténtalo nuevamente.");
    }finally{
      setLoading(false);
    }
  }

  return <main className="authShell authRecoveryShell">
    <section className="authCard authRecoveryCard">
      <div className="authRecoveryMark"><img src="/fragmentun-mark.png" alt="FRAGMENTUN" width="48" height="48"/></div>
      <div className="kicker">ACCESO SEGURO · FRAGMENTUN</div>
      <h1>Recuperar contraseña</h1>
      <p className="lead authRecoveryLead">Escribe el correo de tu cuenta administrativa y te enviaremos un enlace seguro para restablecer el acceso.</p>

      <form onSubmit={submit} className="authRecoveryForm">
        <label>
          <span>Correo electrónico</span>
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/>
        </label>
        <button className="btn btnPrimary" type="submit" disabled={loading}>
          {loading?"Enviando…":"Enviar enlace de recuperación"}
        </button>
      </form>

      <div className="authLinks">
        <Link href="/admin/login">Volver al acceso</Link>
      </div>

      {status&&<div className={`authStatus ${statusType}`} role="status" aria-live="polite">{status}</div>}
    </section>
  </main>;
}
