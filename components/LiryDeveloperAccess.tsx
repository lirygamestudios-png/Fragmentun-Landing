"use client";
import {useRef} from "react";
import styles from "../app/lirygames/lirygames.module.css";
/** Entrada diferenciada de desarrolladores. No solicita contraseñas ni acepta archivos. */
export function LiryDeveloperAccess(){
 const dialog=useRef<HTMLDialogElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 return <>
  <button type="button" ref={trigger} className={styles.gamerCardAction} aria-haspopup="dialog" aria-controls="liry-developer-access-dialog" onClick={()=>dialog.current?.showModal()}>DESARROLLADOR · ACCESO <span aria-hidden="true">→</span></button>
  <dialog id="liry-developer-access-dialog" ref={dialog} className={styles.liryStandaloneDialog} aria-labelledby="liry-developer-access-title" onClose={()=>trigger.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===dialog.current)dialog.current.close()}}>
   <div className={styles.liryStandaloneContent}>
    <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label="Cerrar acceso de desarrolladores">×</button></form>
    <p className={styles.gamerInfoEyebrow}>LIRYGAMES STUDIOS · LIRY DEVELOPER</p>
    <h3 id="liry-developer-access-title">PUBLICA TU VIDEOJUEGO</h3>
    <p className={styles.liryCompactDescription}>Programa de autopublicación supervisada para videojuegos Premium y Freemium.</p>
    <div className={styles.liryCompactNotice} role="status">
     <strong style={{color:"#79e6ff"}}>PRÓXIMAMENTE · SOLICITUDES DESACTIVADAS</strong>
     <p>El desarrollador podrá solicitar admisión, gestionar su ficha y subir versiones a revisión. Solo LIRYGAMES autorizará la publicación.</p>
     <p>No solicitamos todavía archivos, credenciales ni información comercial.</p>
    </div>
    <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>ENTENDIDO</button></form>
   </div>
  </dialog>
 </>;
}
