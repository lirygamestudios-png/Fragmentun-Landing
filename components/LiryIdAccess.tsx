"use client";
import {useRef,useState} from "react";

import styles from "../app/lirygames/lirygames.module.css";
import {getLiryAuthFlow} from "../lib/games/liry-auth-flow-contract";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";

type Mode="entrar"|"registro"|"recuperar";
export function LiryIdAccess({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).liryIdDialog;

 const dialogRef=useRef<HTMLDialogElement>(null);
 const triggerRef=useRef<HTMLButtonElement>(null);
 const [mode,setMode]=useState<Mode>("entrar");
 const current=copy.modes.find(x=>x.id===mode)!;
 const flow=getLiryAuthFlow(mode==="entrar"?"sign_in":mode==="registro"?"register":"recover");
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
    <fieldset disabled aria-label={current.heading} className={styles.liryCredentialPreview}>
     <label className={styles.liryCredentialLabel}>{locale==="es"?"Correo electrónico":"Email address"}<input type="email" autoComplete="off" placeholder={locale==="es"?"Correo (próximamente)":"Email (coming soon)"} className={styles.liryCredentialInput} /></label>
     {mode!=="recuperar"&&<label style={{display:"grid",gap:5}}>{locale==="es"?"Contraseña":"Password"}<input type="password" autoComplete="off" placeholder="••••••••" style={{padding:10,borderRadius:6}} /></label>}
     <button type="button" disabled style={{padding:10,borderRadius:6}}>{current.label}</button>
    </fieldset>
    <div className={styles.liryCompactNotice} role="status" aria-live="polite" data-auth-flow={flow.screen} data-can-submit={String(flow.canSubmit)}>
     <strong style={{color:"#79e6ff"}}>{copy.inactive}</strong>
     <p>{copy.availabilityMessage} {copy.noData}</p>
    </div>
    <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>{copy.ack}</button></form>
   </div>
  </dialog>
 </>;
}
