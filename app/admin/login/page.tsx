"use client";
import Link from "next/link";
import { FormEvent,useEffect,useState } from "react";

export default function AdminLoginPage(){
  const[unauthorized,setUnauthorized]=useState(false);
  const[authError,setAuthError]=useState(false);
  const[email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  const[status,setStatus]=useState("");
  const[statusType,setStatusType]=useState<"info"|"success"|"error">("info");
  const[loading,setLoading]=useState(false);

  useEffect(()=>{
    const qs=new URLSearchParams(window.location.search);
    setUnauthorized(qs.get("unauthorized")==="1");
    setAuthError(qs.get("auth_error")==="1");
  },[]);

  async function signIn(event:FormEvent){
    event.preventDefault();
    setLoading(true);
    setStatusType("info");
    setStatus("Verificando acceso…");
    try{
      const r=await fetch("/api/auth/login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password})
      });
      const j=await r.json().catch(()=>({}));
      if(r.ok){
        const destination=typeof j.redirect==="string"&&j.redirect.startsWith("/admin")?j.redirect:"/admin";
        setStatusType("success");
        setStatus(destination==="/admin/mfa"
          ?"Credenciales correctas. Verifica el segundo factor…"
          :"Acceso correcto. Abriendo Panel de administración…");
        window.location.assign(destination);
        return;
      }
      setStatusType("error");
      setStatus(j.error==="unauthorized"
        ?"La cuenta existe, pero no tiene permisos para entrar al Panel de administración."
        :"Correo o contraseña incorrectos.");
    }catch{
      setStatusType("error");
      setStatus("No fue posible conectar con el servicio de acceso. Revisa tu conexión e inténtalo nuevamente.");
    }finally{
      setLoading(false);
    }
  }

  return <main className="authShell authShellFragmentun">
    <section className="authExperience">
      <div className="authStoryPanel">
        <div className="authBrandLockup">
          <img src="/fragmentun-mark.png" alt="" width="74" height="74"/>
          <div><strong>FRAGMENTUN</strong><span>PANEL DE ADMINISTRACIÓN</span></div>
        </div>
        <div className="authStoryCopy">
          <div className="kicker">CENTRO DE CONTROL · LUMEN</div>
          <h1>El universo detrás de la experiencia.</h1>
          <p>Gestiona contenido, audiencia, personajes, analítica e integraciones desde una interfaz construida con la misma identidad visual de FRAGMENTUN.</p>
          <div className="authStoryStats">
            <span><b>01</b> Contenido</span>
            <span><b>02</b> Audiencia</span>
            <span><b>03</b> Conversión</span>
          </div>
        </div>
        <div className="authStoryFooter">JOSÉ LIRANZO · FRAGMENTUN</div>
      </div>

      <section className="authCard authCardPremium">
        <div className="authCardMark"><img src="/fragmentun-mark.png" alt="FRAGMENTUN" width="54" height="54"/></div>
        <div className="kicker">ACCESO SEGURO</div>
        <h2>Bienvenido de nuevo</h2>
        <p className="lead">Ingresa con tus credenciales autorizadas para abrir el panel.</p>
        {unauthorized&&<div className="formNotice">Tu sesión no tiene permisos administrativos.</div>}
        {authError&&<div className="formNotice">El enlace de acceso o recuperación no es válido o expiró.</div>}
        <form onSubmit={signIn} className="authForm">
          <label><span>Correo electrónico</span><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label>
          <label><span>Contraseña</span><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></label>
          <button className="btn btnPrimary authSubmit" type="submit" disabled={loading}>{loading?"Verificando acceso…":"Entrar al Panel"}</button>
        </form>
        <div className="authLinks">
          <Link href="/admin/forgot-password">¿Olvidaste tu contraseña?</Link>
          <Link href="/es">Volver al sitio</Link>
        </div>
        {status&&<p className={`note authStatus ${statusType}`} role="status" aria-live="polite">{status}</p>}
      </section>
    </section>
  </main>;
}
