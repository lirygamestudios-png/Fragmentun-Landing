"use client";
import Link from "next/link";
import { FormEvent,useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage(){
  const router=useRouter();
  const[password,setPassword]=useState("");
  const[confirm,setConfirm]=useState("");
  const[status,setStatus]=useState("");
  const[loading,setLoading]=useState(false);

  async function submit(event:FormEvent){
    event.preventDefault();

    if(password!==confirm){
      setStatus("Las contraseñas no coinciden.");
      return;
    }

    if(password.length<12){
      setStatus("La contraseña debe tener al menos 12 caracteres.");
      return;
    }

    setLoading(true);
    const r=await fetch("/api/auth/update-password",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({password})
    });
    const j=await r.json().catch(()=>({}));

    if(r.ok){
      setStatus("Contraseña actualizada correctamente.");
      setTimeout(()=>router.replace("/admin"),700);
      return;
    }

    setLoading(false);
    setStatus(j.error==="unauthorized"
      ?"El enlace de recuperación expiró o la sesión ya no es válida."
      :"No fue posible actualizar la contraseña.");
  }

  return <main className="authShell authRecoveryShell">
    <section className="authCard authRecoveryCard">
      <div className="authRecoveryMark"><img src="/fragmentun-mark.png" alt="FRAGMENTUN" width="48" height="48"/></div>
      <div className="kicker">ACCESO SEGURO · FRAGMENTUN</div>
      <h1>Nueva contraseña</h1>
      <p className="lead authRecoveryLead">Crea una contraseña nueva para tu cuenta administrativa. Debe tener al menos 12 caracteres.</p>

      <form onSubmit={submit} className="authRecoveryForm">
        <label>
          <span>Nueva contraseña</span>
          <input type="password" required minLength={12} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password"/>
        </label>
        <label>
          <span>Confirmar contraseña</span>
          <input type="password" required minLength={12} value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password"/>
        </label>
        <button className="btn btnPrimary" type="submit" disabled={loading}>
          {loading?"Actualizando…":"Guardar nueva contraseña"}
        </button>
      </form>

      <div className="authLinks">
        <Link href="/admin/login">Volver al acceso</Link>
      </div>

      {status&&<p className="note" role="status">{status}</p>}
    </section>
  </main>;
}
