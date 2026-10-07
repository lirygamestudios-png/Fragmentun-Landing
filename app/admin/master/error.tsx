"use client";

export default function MasterAdminError({reset}:{error:Error&{digest?:string};reset:()=>void}){
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
      <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginTop:"20px"}}>
        <button type="button" onClick={()=>reset()} style={{
          border:"1px solid rgba(201,168,76,.45)",background:"rgba(201,168,76,.10)",color:"#e8d28d",
          borderRadius:"8px",padding:"11px 15px",fontWeight:700,cursor:"pointer"
        }}>Reintentar</button>
        <a href="/admin/master" style={{
          textDecoration:"none",border:"1px solid rgba(255,255,255,.14)",color:"#d5deeb",
          borderRadius:"8px",padding:"11px 15px"
        }}>Volver al inicio</a>
      </div>
    </section>
  </main>;
}
