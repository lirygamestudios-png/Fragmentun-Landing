"use client";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset
}:{
  error:Error & {digest?:string};
  reset:()=>void;
}){
  useEffect(()=>{console.error(error)},[error]);

  return <html lang="es">
    <body>
      <main className="authShell">
        <section className="authCard">
          <div className="kicker">FRAGMENTUN</div>
          <h1>Algo salió mal</h1>
          <p className="lead">No pudimos completar esta acción. Tus datos no se han descartado intencionalmente.</p>
          {error.digest&&<p className="note">Referencia: {error.digest}</p>}
          <div className="heroActions">
            <button className="btn btnPrimary" onClick={()=>reset()}>Intentar de nuevo</button>
            <a className="btn btnGhost" href="/es">Volver al sitio</a>
          </div>
        </section>
      </main>
    </body>
  </html>;
}
