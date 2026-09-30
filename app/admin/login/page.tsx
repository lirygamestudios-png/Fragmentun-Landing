"use client";
import { FormEvent,useState } from "react";
import { createSupabaseBrowserClient } from "../../../lib/supabase/browser";

export default function AdminLoginPage(){
  const[email,setEmail]=useState("");
  const[status,setStatus]=useState("");
  async function signIn(event:FormEvent){
    event.preventDefault();
    setStatus("Enviando acceso…");
    const supabase=createSupabaseBrowserClient();
    const callback=`${window.location.origin}/auth/callback?next=/admin`;
    const{error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:callback,shouldCreateUser:true}});
    setStatus(error?"No se pudo enviar el enlace de acceso.":"Revisa tu correo. Te enviamos un enlace seguro para entrar al Control Center.");
  }
  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#050A12",color:"#E2E8F0",padding:24}}>
    <form onSubmit={signIn} style={{width:"min(460px,92vw)",padding:32,border:"1px solid #ffffff22",borderRadius:20,background:"#0A1628"}}>
      <div style={{color:"#C9A84C",letterSpacing:".16em"}}>FRAGMENTUN CONTROL CENTER</div>
      <h1>Acceso administrativo</h1>
      <p>Solo los correos autorizados reciben permisos del panel.</p>
      <input style={{width:"100%",padding:14,borderRadius:10,margin:"16px 0"}} type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Correo autorizado" autoComplete="email"/>
      <button style={{width:"100%",padding:14,borderRadius:999,border:0,fontWeight:800,background:"#C9A84C"}}>Enviar enlace de acceso</button>
      <p>{status}</p>
    </form>
  </main>;
}
