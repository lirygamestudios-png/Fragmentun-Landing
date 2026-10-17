"use client";
import {useRef,useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";

type Visibility="private"|"friends"|"public";
export function LiryPrivacyPreview({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).privacyPreview;

 const ref=useRef<HTMLDialogElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 const [visibility,setVisibility]=useState<Visibility>("private");
 const [language,setLanguage]=useState<"es"|"en">("es");
 const [marketing,setMarketing]=useState(false);
 const [tab,setTab]=useState<"privacidad"|"avisos">("privacidad");
 function reset(){setVisibility("private");setLanguage("es");setMarketing(false);setTab("privacidad");}
 return <>
  <button type="button" ref={trigger} className={styles.gamerCardAction} aria-haspopup="dialog" onClick={()=>{reset();ref.current?.showModal()}}>{copy.open} <span aria-hidden="true">→</span></button>
  <dialog ref={ref} className={styles.liryStandaloneDialog} aria-label={copy.dialog} onClose={()=>trigger.current?.focus({preventScroll:true})} onClick={e=>{if(e.target===ref.current)ref.current.close()}}>
   <div className={styles.liryStandaloneContent}>
    <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label={copy.closeAria}>×</button></form>
    <p className={styles.gamerInfoEyebrow}>LIRYGAMES STUDIOS · LIRY ID</p>
    <h3>{copy.title}</h3>
    <p className={styles.liryCompactDescription}>{copy.intro}</p>
    <div className={styles.liryPrivacyTabs} role="group" aria-label={copy.sectionsAria}>
     <button type="button" className={styles.gamerInfoDone} aria-pressed={tab==="privacidad"} onClick={()=>setTab("privacidad")}>{copy.privacy}</button>
     <button type="button" className={styles.gamerInfoDone} aria-pressed={tab==="avisos"} onClick={()=>setTab("avisos")}>{copy.preferences}</button>
    </div>
    {tab==="privacidad"?<div className={styles.liryPrivacyVisibility} role="radiogroup" aria-label={copy.visibilityAria}>
      <strong className={styles.liryPrivacyHeading}>{copy.visibility}</strong>
      {([["private",copy.visibilityLabels[0]],["friends",copy.visibilityLabels[1]],["public",copy.visibilityLabels[2]]] as const).map(([value,label])=><label key={value} className={styles.liryPrivacyRadioRow}><input type="radio" name="liry-visibility" checked={visibility===value} onChange={()=>setVisibility(value)}/><span>{label}</span></label>)}
      <p className={styles.liryPrivacyHint}>{copy.privacyHint}</p>
    </div> :<div className={styles.liryPrivacyOptions}>
      <label className={styles.liryLanguageRow}><span>{copy.language}</span><select value={language} onChange={e=>setLanguage(e.target.value as "es"|"en")} className={styles.liryLanguageSelect}><option value="es">Español</option><option value="en">English</option></select></label>
      <label className={styles.liryMarketingRow}><input type="checkbox" checked={marketing} onChange={e=>setMarketing(e.target.checked)}/> {copy.marketing}</label>
      <small>{copy.marketingHint}</small>
    </div>}
    <p aria-live="polite" className={styles.liryCompactStatus}>{tab==="privacidad"?`${copy.visibilityStatus}: ${visibility==="private"?copy.visibilityStates[0]:visibility==="friends"?copy.visibilityStates[1]:copy.visibilityStates[2]}`:`${copy.languageStatus}: ${language==="es"?"Español":"English"} · ${copy.marketingStatus}: ${marketing?copy.yes:copy.no}`} · {copy.unsaved}</p>
    <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>{copy.close}</button></form>
   </div>
  </dialog>
 </>;
}
