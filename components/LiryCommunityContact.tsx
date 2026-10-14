"use client";
import {useRef} from "react";
import {LiryContactForm} from "./LiryContactForm";
import styles from "../app/lirygames/lirygames.module.css";
export function LiryCommunityContact(){
 const dialog=useRef<HTMLDialogElement>(null);
 const opener=useRef<HTMLButtonElement>(null);
 return <>
  <button ref={opener} className={styles.communityContactAction} type="button" aria-haspopup="dialog" aria-controls="liry-community-contact" onClick={()=>{if(dialog.current&&!dialog.current.open)dialog.current.showModal()}}>CONTACTAR CON LIRYGAMES →</button>
  <dialog ref={dialog} id="liry-community-contact" className={styles.liryStandaloneDialog} aria-labelledby="community-contact-heading" onClose={()=>opener.current?.focus({preventScroll:true})}>
   <div className={styles.liryStandaloneContent}>
    <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label="Cerrar contacto">×</button></form>
    <p className={styles.gamerInfoEyebrow}>COMUNIDAD · CONTACTO</p>
    <h2 id="community-contact-heading">CONTACTA CON LIRYGAMES</h2>
    <p className={styles.liryCompactDescription}>Comparte sugerencias, opiniones sobre nuestros videojuegos o propuestas de colaboración.</p>
    <LiryContactForm />
   </div>
  </dialog>
 </>;
}
