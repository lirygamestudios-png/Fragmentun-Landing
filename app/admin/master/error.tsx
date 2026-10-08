"use client";

import {useState} from "react";
import styles from "./master-admin.module.css";

export default function MasterAdminError({reset}:{error:Error&{digest?:string};reset:()=>void}){
  const[retrying,setRetrying]=useState(false);

  function retry(){
    if(retrying)return;
    setRetrying(true);
    reset();
  }

  return <main className={styles.statePage}>
    <section className={styles.stateCard}>
      <span className={styles.stateSigil} aria-hidden="true"><i></i></span>
      <div className={styles.stateKicker}>LIRYGAMES · ACCIÓN NO COMPLETADA</div>
      <h1>No fue posible completar la acción</h1>
      <p>Revisa los datos e inténtalo nuevamente. No se aplicó ningún cambio confirmado desde esta pantalla.</p>
      {retrying&&<p role="status" aria-live="polite" className={styles.stateStatus}>Reintentando la acción…</p>}
      <div className={styles.stateActions}>
        <button type="button" onClick={retry} disabled={retrying} aria-busy={retrying} className={styles.statePrimary}>
          {retrying?"Reintentando…":"Reintentar"}
        </button>
        <a href="/admin/master" className={styles.stateSecondary}>Volver al Commander Center</a>
      </div>
    </section>
  </main>;
}
