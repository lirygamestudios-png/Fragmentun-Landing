"use client";
import {useRef} from "react";
import styles from "../app/lirygames/lirygames.module.css";
import {liryFrontdeskStrings} from "../lib/games/liry-frontdesk-i18n";
const copy=liryFrontdeskStrings("es").liryBoost;
export function LiryBoostEnrollment(){
 const dialogRef=useRef<HTMLDialogElement>(null);
 const triggerRef=useRef<HTMLButtonElement>(null);
 return <>
  <button ref={triggerRef} type="button" className={styles.liryBoostOpen} onClick={()=>dialogRef.current?.showModal()} aria-haspopup="dialog" aria-controls="liryboost-inscripcion">{copy.open} →</button>
  <dialog ref={dialogRef} id="liryboost-inscripcion" className={styles.gamerInfoDialog} aria-labelledby="liryboost-enrollment-title" onClose={()=>triggerRef.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===dialogRef.current)dialogRef.current.close()}}>
   <div className={styles.gamerInfoDialogInside}>
    <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label="Cerrar inscripción y volver al FrontDesk">×</button></form>
    <p className={styles.gamerInfoEyebrow}>LIRYGAMES STUDIOS · PARTICIPACIÓN</p>
    <h3 id="liryboost-enrollment-title">{copy.title}</h3>
    <div className={styles.liryBoostEnrollment}>
     <p>{copy.description}</p>
     <p id="liryboost-form-status" className={styles.liryBoostPreviewNotice} role="status">{copy.preview}</p>
     <form aria-label="Vista previa del formulario LiryBoost" aria-describedby="liryboost-form-status" className={styles.liryBoostEnrollmentForm} onSubmit={event=>event.preventDefault()}>
      <label>{copy.publicName} <input type="text" name="displayName" placeholder="Tu nombre de participante" autoComplete="off" disabled /></label>
      <label>{copy.email} <input type="email" name="email" placeholder="tu@email.com" autoComplete="off" disabled /></label>
      <label className={styles.liryBoostConsent}><input type="checkbox" name="consent" disabled /><span>{copy.consent}</span></label>
      <button type="button" disabled>{copy.upcoming}</button>
     </form>
    </div>
    <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>ENTENDIDO</button></form>
   </div>
  </dialog>
 </>;
}
