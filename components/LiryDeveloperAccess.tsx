"use client";
import {useRef} from "react";
import Link from "next/link";
import styles from "../app/lirygames/lirygames.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";

/** Entrada diferenciada de desarrolladores. No solicita contraseñas ni acepta archivos. */
export function LiryDeveloperAccess({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).developerDialog;

 const dialog=useRef<HTMLDialogElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 return <>
  <button type="button" ref={trigger} className={styles.developerNavAccess} aria-label={copy.openAria} title={copy.openTitle} aria-haspopup="dialog" aria-controls="liry-developer-access-dialog" onClick={()=>{if(dialog.current&&!dialog.current.open)dialog.current.showModal()}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/></svg><span>{copy.navLabel}</span></button>
  <dialog id="liry-developer-access-dialog" ref={dialog} className={styles.liryStandaloneDialog} aria-labelledby="liry-developer-access-title" onClose={()=>trigger.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===dialog.current)dialog.current.close()}}>
   <div className={styles.liryStandaloneContent}>
    <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label={copy.closeAria}>×</button></form>
    <p className={styles.gamerInfoEyebrow}>{copy.eyebrow}</p>
    <h3 id="liry-developer-access-title">{copy.title}</h3>
    <p className={styles.liryCompactDescription}>{copy.intro}</p>
    <div className={styles.liryCompactNotice} role="status">
     <strong style={{color:"#79e6ff"}}>{copy.inactive}</strong>
     <p>{copy.admission}</p>
     <p>{copy.noData}</p>
    </div>
    <Link href={`/lirygames/developer?lang=${locale}`} className={styles.gamerInfoDone}>{copy.panel} →</Link>
    <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>{copy.close}</button></form>
   </div>
  </dialog>
 </>;
}
