"use client";
import {useRef,useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";

export function LiryBoostEnrollment({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).liryBoost;

 const dialogRef=useRef<HTMLDialogElement>(null);
 const [opened,setOpened]=useState(false);
 const triggerRef=useRef<HTMLButtonElement>(null);
 return <>
  <button ref={triggerRef} type="button" className={styles.liryBoostOpen} onClick={()=>{if(dialogRef.current&&!dialogRef.current.open){dialogRef.current.showModal();setOpened(true)}}} aria-haspopup="dialog" aria-expanded={opened} aria-controls="liryboost-inscripcion">{copy.open} →</button>
  <dialog ref={dialogRef} id="liryboost-inscripcion" className={styles.gamerInfoDialog} aria-labelledby="liryboost-enrollment-title" onClose={()=>{setOpened(false);if(triggerRef.current?.isConnected)triggerRef.current.focus({preventScroll:true})}} onClick={event=>{if(event.target===dialogRef.current)dialogRef.current.close()}}>
   <div className={styles.gamerInfoDialogInside}>
    <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label={copy.closeAria}>×</button></form>
    <p className={styles.gamerInfoEyebrow}>{copy.eyebrow}</p>
    <h3 id="liryboost-enrollment-title">{copy.title}</h3>
    <div className={styles.liryBoostEnrollment}>
     <p>{copy.description}</p>
     <p id="liryboost-form-status" className={styles.liryBoostPreviewNotice} role="status">{copy.preview}</p>
     <form aria-label={copy.formAria} aria-describedby="liryboost-form-status" className={styles.liryBoostEnrollmentForm} onSubmit={event=>event.preventDefault()}>
      <label>{copy.publicName} <input type="text" name="displayName" placeholder={copy.namePlaceholder} autoComplete="off" disabled /></label>
      <label>{copy.email} <input type="email" name="email" placeholder={copy.emailPlaceholder} autoComplete="off" disabled /></label>
      <label className={styles.liryBoostConsent}><input type="checkbox" name="consent" disabled /><span>{copy.consent}</span></label>
      <button type="button" disabled>{copy.upcoming}</button>
     </form>
    </div>
    <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>{copy.acknowledge}</button></form>
   </div>
  </dialog>
 </>;
}
