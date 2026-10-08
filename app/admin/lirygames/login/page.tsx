"use client";
import Link from "next/link";
import {FormEvent,useEffect,useState} from "react";

export default function LiryGamesLoginPage(){
  const[unauthorized,setUnauthorized]=useState(false);
  const[email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  const[status,setStatus]=useState("");
  const[statusType,setStatusType]=useState<"info"|"success"|"error">("info");
  const[loading,setLoading]=useState(false);

  useEffect(()=>{
    const qs=new URLSearchParams(window.location.search);
    setUnauthorized(qs.get("unauthorized")==="1");
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
        setStatusType("success");
        setStatus("Credenciales correctas. Abriendo LIRYGAMES…");
        window.location.assign("/admin/lirygames/mfa");
        return;
      }
      setStatusType("error");
      setStatus(
        j.error==="unauthorized"
          ?"La cuenta existe, pero no tiene permisos administrativos."
          :j.error==="too_many_attempts"
            ?"Se alcanzó el límite temporal de intentos. Inténtalo nuevamente más tarde."
            :j.error==="payload_too_large"
              ?"La solicitud no pudo procesarse. Revisa los datos e inténtalo nuevamente."
              :"Correo o contraseña incorrectos."
      );
    }catch{
      setStatusType("error");
      setStatus("No fue posible conectar con el servicio de acceso. Revisa tu conexión e inténtalo nuevamente.");
    }finally{
      setLoading(false);
    }
  }

  return <main className="authShell authShellLiry">
    <section className="authExperience">
      <div className="authStoryPanel">
        <div className="authBrandLockup">
          <span className="authLirySigil" aria-hidden="true"><i></i></span>
          <div><strong>LIRYGAMES</strong><span>COMMANDER CENTER</span></div>
        </div>
        <div className="authStoryCopy">
          <div className="kicker">CENTRO DE MANDO · ESTUDIO</div>
          <h1>Todo el estudio, desde un solo lugar.</h1>
          <p>Supervisa videojuegos, ventas, comunidad, operaciones, seguridad y crecimiento desde el Commander Center de LIRYGAMES STUDIOS.</p>
          <div className="authStoryStats">
            <span><b>01</b> Portafolio</span>
            <span><b>02</b> Negocio</span>
            <span><b>03</b> Control</span>
          </div>
        </div>
        <div className="authStoryFooter">LIRYGAMES STUDIOS · COMMANDER CENTER</div>
      </div>

      <section className="authCard authCardPremium">
        <div className="authCardMark"><span className="authLirySigil" aria-hidden="true"><i></i></span></div>
        <div className="kicker">ACCESO SEGURO</div>
        <h2>Acceso LIRYGAMES</h2>
        <p className="lead">Ingresa con tus credenciales administrativas autorizadas.</p>
        {unauthorized&&<div className="authStatus error" role="alert">Tu sesión no tiene permisos para entrar al Commander Center.</div>}
        <form onSubmit={signIn} className="authForm">
          <label><span>Correo electrónico</span><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label>
          <label><span>Contraseña</span><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></label>
          <button className="btn btnPrimary authSubmit" type="submit" disabled={loading}>{loading?"Verificando acceso…":"Entrar al Commander Center"}</button>
        </form>
        <div className="authLinks">
          <Link href="/admin/lirygames/forgot-password">¿Olvidaste tu contraseña?</Link>
          <Link href="/admin/login">Acceso FRAGMENTUN</Link>
        </div>
        {status&&<p className={`note authStatus ${statusType}`} role="status" aria-live="polite">{status}</p>}
      </section>
    </section>
  </main>;
}
