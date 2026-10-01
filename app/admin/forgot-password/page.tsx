"use client";
import Link from "next/link";
import { FormEvent,useState } from "react";

export default function ForgotPasswordPage(){
  const[email,setEmail]=useState("");
  const[status,setStatus]=useState("");
  const[loading,setLoading]=useState(false);

  async function submit(event:FormEvent){
    event.preventDefault();
    setLoading(true);
    setStatus("");

    await fetch("/api/auth/forgot-password",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({email})
    });

    setLoading(false);
    setStatus("Si existe una cuenta asociada a ese correo, recibirás un enlace seguro para restablecer la contraseña.");
  }

  return <main className="authShell">
    <section className="authCard">
      <div className="kicker">FRAGMENTUN CONTROL CENTER</div>
      <h1>Recuperar contraseña</h1>
      <p className="lead">Escribe el correo de tu cuenta administrativa.</p>

      <form onSubmit={submit} className="formGrid">
        <label>
          <span>Correo electrónico</span>
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/>
        </label>
        <button className="btn btnPrimary" type="submit" disabled={loading}>
          {loading?"Enviando…":"Enviar enlace de recuperación"}
        </button>
      </form>

      <div className="authLinks">
        <Link href="/admin/login">Volver al login</Link>
      </div>

      {status&&<div className="formNotice" role="status">{status}</div>}
    </section>
  </main>;
}
