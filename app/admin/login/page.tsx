"use client";
import Link from "next/link";
import { FormEvent,useState } from "react";
import { useRouter,useSearchParams } from "next/navigation";

export default function AdminLoginPage(){
  const router=useRouter();
  const params=useSearchParams();
  const[email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  const[status,setStatus]=useState("");
  const[loading,setLoading]=useState(false);

  async function signIn(event:FormEvent){
    event.preventDefault();
    setLoading(true);
    setStatus("Verificando acceso…");

    const r=await fetch("/api/auth/login",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({email,password})
    });
    const j=await r.json().catch(()=>({}));

    if(r.ok){
      setStatus("Acceso correcto. Abriendo Control Center…");
      router.replace("/admin");
      router.refresh();
      return;
    }

    setLoading(false);
    setStatus(
      j.error==="unauthorized"
        ?"La cuenta existe, pero no tiene permisos para entrar al Control Center."
        :"Correo o contraseña incorrectos."
    );
  }

  return <main className="authShell">
    <section className="authCard">
      <div className="kicker">FRAGMENTUN CONTROL CENTER</div>
      <h1>Acceso administrativo</h1>
      <p className="lead">Entra con tu correo autorizado y contraseña.</p>

      {params.get("unauthorized")==="1"&&
        <div className="formNotice">Tu sesión no tiene permisos administrativos.</div>}

      <form onSubmit={signIn} className="formGrid">
        <label>
          <span>Correo electrónico</span>
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/>
        </label>
        <label>
          <span>Contraseña</span>
          <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/>
        </label>
        <button className="btn btnPrimary" type="submit" disabled={loading}>
          {loading?"Entrando…":"Entrar"}
        </button>
      </form>

      <div className="authLinks">
        <Link href="/admin/forgot-password">¿Olvidaste tu contraseña?</Link>
        <Link href="/es">Volver al sitio</Link>
      </div>

      {status&&<p className="note" role="status">{status}</p>}
    </section>
  </main>;
}
