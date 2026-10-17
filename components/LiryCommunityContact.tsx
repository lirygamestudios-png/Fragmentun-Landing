"use client";
import {useRef,useState} from "react";
import {LiryContactForm} from "./LiryContactForm";
import styles from "../app/lirygames/lirygames.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";

export function LiryCommunityContact({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).communityDialogs.contact;

 const dialog=useRef<HTMLDialogElement>(null);
 const opener=useRef<HTMLButtonElement>(null);
 const [opened,setOpened]=useState(false);
 return <>
  <button ref={opener} className={styles.communityContactAction} type="button" aria-haspopup="dialog" aria-controls="liry-community-contact" aria-expanded={opened} onClick={()=>{if(dialog.current&&!dialog.current.open){dialog.current.showModal();setOpened(true)}}}>{copy.trigger} →</button>
  <dialog ref={dialog} id="liry-community-contact" className={styles.liryStandaloneDialog} aria-labelledby="community-contact-heading" onClose={()=>{setOpened(false);opener.current?.focus({preventScroll:true})}}>
   <div className={styles.liryStandaloneContent}>
    <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label={copy.closeAria}>×</button></form>
    <p className={styles.gamerInfoEyebrow}>{copy.eyebrow}</p>
    <h2 id="community-contact-heading">{copy.title}</h2>
    <p className={styles.liryCompactDescription}>{copy.intro}</p>
    {opened&&<LiryContactForm locale={locale} />}
   </div>
  </dialog>
 </>;
}
