"use client";
import {useEffect,useRef,useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";
export function LiryBoostEnrollment(){
 const [open,setOpen]=useState(false);
 const triggerRef=useRef<HTMLButtonElement>(null);
 const closeRef=useRef<HTMLButtonElement>(null);
 function closeEnrollment(){setOpen(false);triggerRef.current?.focus();}
 useEffect(()=>{
  if(!open)return;
  closeRef.current?.focus();
  const onKeyDown=(event:KeyboardEvent)=>{if(event.key==="Escape"){event.preventDefault();closeEnrollment();}};
  document.addEventListener("keydown",onKeyDown);
  return ()=>document.removeEventListener("keydown",onKeyDown);
 },[open]);
 return <>
  <button ref={triggerRef} type="button" className={styles.liryBoostOpen} onClick={()=>setOpen(true)} aria-expanded={open} aria-controls="liryboost-inscripcion">INSCRÍBETE EN LIRYBOOST →</button>
  {open&&<div id="liryboost-inscripcion" className={styles.liryBoostEnrollment} aria-labelledby="liryboost-enrollment-title">
   <button ref={closeRef} type="button" className={styles.liryBoostClose} aria-label="Cerrar inscripción y volver al FrontDesk" onClick={closeEnrollment}>×</button>
   <div><strong id="liryboost-enrollment-title">INSCRIPCIÓN LIRYBOOST</strong><p>La inscripción abrirá cuando publiquemos las bases oficiales y habilitemos la verificación segura de participantes.</p></div>
   <p id="liryboost-form-status" className={styles.liryBoostPreviewNotice} role="status">VISTA PREVIA · Formulario inactivo. No introduzcas datos personales: todavía no se reciben inscripciones.</p>
   <form aria-label="Vista previa del formulario LiryBoost" aria-describedby="liryboost-form-status" className={styles.liryBoostEnrollmentForm}>
    <label>Nombre público <input type="text" name="displayName" placeholder="Tu nombre de participante" autoComplete="off" disabled /></label>
    <label>Correo electrónico <input type="email" name="email" placeholder="tu@email.com" autoComplete="off" disabled /></label>
    <label className={styles.liryBoostConsent}><input type="checkbox" name="consent" disabled /><span>Acepto las bases y la política de privacidad (pendientes de publicación).</span></label>
    <button type="button" disabled>INSCRIPCIONES PRÓXIMAMENTE</button>
   </form>
  </div>}
 </>;
}
