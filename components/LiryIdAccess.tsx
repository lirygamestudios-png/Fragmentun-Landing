"use client";
import {useRef,useState} from "react";

import styles from "../app/lirygames/lirygames.module.css";
import {liryFrontdeskStrings} from "../lib/games/liry-frontdesk-i18n";
const copy=liryFrontdeskStrings("es").liryIdDialog;
type Mode="entrar"|"registro"|"recuperar";
export function LiryIdAccess(){
 const dialogRef=useRef<HTMLDialogElement>(null);
 const triggerRef=useRef<HTMLButtonElement>(null);
 const [mode,setMode]=useState<Mode>("entrar");
 const current=copy.modes.find(x=>x.id===mode)!;
 return <>
  <button type="button" ref={triggerRef} className={styles.gamerCardAction} aria-haspopup="dialog" onClick={()=>{setMode("entrar");dialogRef.current?.showModal()}}>{copy.trigger} <span aria-hidden="true">→</span></button>
  <dialog ref={dialogRef} className={styles.liryStandaloneDialog} aria-label={copy.dialog} onClose={()=>triggerRef.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===dialogRef.current)dialogRef.current.close()}}>
   <div className={styles.liryStandaloneContent}>
    <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label={copy.closeAria}>×</button></form>
    <p className={styles.gamerInfoEyebrow}>{copy.eyebrow}</p>
    <h3>{current.heading}</h3>
    <div className={styles.liryAccessTabs} role="group" aria-label={copy.optionsAria}>
     {copy.modes.map(x=><button type="button" key={x.id} aria-pressed={mode===x.id} onClick={()=>setMode(x.id)} className={styles.liryAccessTab}>{x.label}</button>)}
    </div>
    <p className={styles.liryCompactDescription} aria-live="polite">{current.description}</p>
    <div className={styles.liryCompactNotice}>
     <strong style={{color:"#79e6ff"}}>{copy.inactive}</strong>
     <p>{copy.availabilityMessage} {copy.noData}</p>
    </div>
    <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>{copy.ack}</button></form>
   </div>
  </dialog>
 </>;
}
