"use client";
import {useRef} from "react";
import styles from "../app/lirygames/lirygames.module.css";
export function LirySecretsInfo(){
 const dialog=useRef<HTMLDialogElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 return <>
  <button ref={trigger} type="button" className={styles.bannerCta} aria-haspopup="dialog" onClick={()=>dialog.current?.showModal()}>CONOCE LOS SECRETOS →</button>
  <dialog ref={dialog} className={styles.gamerInfoDialog} aria-label="Cómo funcionarán los secretos de Liry" onClose={()=>trigger.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===dialog.current)dialog.current.close()}}>
   <div className={styles.gamerInfoDialogInside}>
    <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label="Cerrar información">×</button></form>
    <p className={styles.gamerInfoEyebrow}>LIRYGAMES STUDIOS · PRÓXIMAMENTE</p>
    <h3>SECRETOS DE LIRY</h3>
    <p>Esta experiencia está prevista para futuros lanzamientos. Los fragmentos ocultos y sus desafíos se anunciarán cuando estén preparados.</p>
    <p>Todavía no hay fragmentos disponibles, progreso que registrar ni recompensas que reclamar.</p>
    <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>ENTENDIDO</button></form>
   </div>
  </dialog>
 </>;
}
