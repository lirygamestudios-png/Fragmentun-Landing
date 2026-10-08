"use client";

import {useState} from "react";

export default function MasterAdminError({reset}:{error:Error&{digest?:string};reset:()=>void}){
  const[retrying,setRetrying]=useState(false);

  function retry(){
    if(retrying)return;
    setRetrying(true);
    reset();
  }

  return <main style={{
    minHeight:"100vh",
    background:"#070d18",
    color:"#eef3fb",
    display:"grid",
    placeItems:"center",
    padding:"24px",
    fontFamily:"Inter,Arial,sans-serif"
  }}>
    <section style={{
      width:"min(620px,100%)",
      background:"#0b1524",
      border:"1px solid rgba(201,168,76,.28)",
      borderRadius:"14px",
      padding:"28px"
    }}>
      <div style={{fontSize:".68rem",letterSpacing:".2em",color:"#c9a84c"}}>LIRYGAMES · ACCIÓN NO COMPLETADA</div>
      <h1 style={{margin:"10px 0 8px",fontSize:"1.7rem"}}>No fue posible completar la acción</h1>
      <p style={{color:"#93a0b3",lineHeight:1.6}}>
        Revisa los datos e inténtalo nuevamente. No se aplicó ningún cambio confirmado desde esta pantalla.
      </p>
      {retrying&&<p role="status" aria-live="polite" style={{
        margin:"14px 0 0",
        color:"#9ecbfa",
        fontSize:".8rem",
        fontWeight:700
      }}>Reintentando la acción…</p>}
      <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginTop:"20px"}}>
        <button type="button" onClick={retry} disabled={retrying} aria-busy={retrying} style={{
          border:"1px solid rgba(74,144,217,.55)",
          background:retrying?"rgba(74,144,217,.07)":"rgba(74,144,217,.13)",
          color:"#c8e3fb",
          borderRadius:"8px",
          padding:"11px 15px",
          fontWeight:700,
          cursor:retrying?"wait":"pointer",
          opacity:retrying?.72:1
        }}>{retrying?"Reintentando…":"Reintentar"}</button>
        <a href="/admin/master" style={{
          textDecoration:"none",border:"1px solid rgba(255,255,255,.14)",color:"#d5deeb",
          borderRadius:"8px",padding:"11px 15px"
        }}>Volver al inicio</a>
      </div>
    </section>
  </main>;
}
