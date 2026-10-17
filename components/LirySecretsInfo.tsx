"use client";
import {useRef} from "react";
import styles from "../app/lirygames/lirygames.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";

export function LirySecretsInfo({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).secrets;

 const dialog=useRef<HTMLDialogElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 return <>
  <button ref={trigger} type="button" className={styles.bannerCta} aria-haspopup="dialog" onClick={()=>dialog.current?.showModal()}>{copy.open} →</button>
  <dialog ref={dialog} className={styles.gamerInfoDialog} aria-label={copy.dialog} onClose={()=>trigger.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===dialog.current)dialog.current.close()}}>
   <div className={styles.gamerInfoDialogInside}>
    <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label={copy.close}>×</button></form>
    <p className={styles.gamerInfoEyebrow}>{copy.eyebrow}</p>
    <h3>{copy.title}</h3>
    <p>{copy.description}</p>
    <p>{copy.empty}</p>
    <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>{copy.acknowledge}</button></form>
   </div>
  </dialog>
 </>;
}
