"use client";
import {useRef,useState} from "react";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
import {LiryDeveloperAdmissionPreview} from "./LiryDeveloperAdmissionPreview";
import {LiryDeveloperGameListingPreview} from "./LiryDeveloperGameListingPreview";
import {LiryDeveloperReleasePreview} from "./LiryDeveloperReleasePreview";
import {LiryDeveloperFinancePreview} from "./LiryDeveloperFinancePreview";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";


type AreaId="admission"|"listing"|"release"|"finance";
export function LiryDeveloperAreas({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).developerAreas;
 const areas=copy.areas;
 const [selected,setSelected]=useState<AreaId>("admission");
 const [session,setSession]=useState(0);
 const [dialogOpen,setDialogOpen]=useState(false);
 const modal=useRef<HTMLDialogElement>(null);
 const opener=useRef<HTMLButtonElement|null>(null);
 const close=useRef<HTMLButtonElement>(null);
 const areaHeading=useRef<HTMLHeadingElement>(null);
 const currentIndex=areas.findIndex(area=>area.id===selected);
 const switchArea=(direction:-1|1)=>{const next=areas[currentIndex+direction];if(next){setSelected(next.id as AreaId);setSession(v=>v+1);if(modal.current)modal.current.scrollTop=0;requestAnimationFrame(()=>areaHeading.current?.focus({preventScroll:true}));}};
 const open=(id:AreaId,trigger:HTMLButtonElement)=>{
  if(modal.current?.open)return;
  setSelected(id);opener.current=trigger;setDialogOpen(true);
  modal.current?.showModal();
  if(modal.current)modal.current.scrollTop=0;
  requestAnimationFrame(()=>{if(modal.current?.open)close.current?.focus({preventScroll:true})});
 };
 return <>
  <div className={styles.grid}>{areas.map(area=><article key={area.id} className={styles.card}>
   <h3>{area.label}</h3><p>{area.description}</p><small>{copy.preparing}</small>
   <button type="button" className={styles.areaLink} aria-haspopup="dialog" aria-expanded={dialogOpen&&selected===area.id} aria-label={`${copy.openAria} ${area.label}`} onClick={event=>open(area.id,event.currentTarget)}>{copy.open} →</button>
  </article>)}</div>
  <dialog className={styles.developerDialog} ref={modal} aria-modal="true" aria-describedby="liry-developer-area-description" aria-labelledby="liry-developer-area-heading" onClose={()=>{setDialogOpen(false);setSession(value=>value+1);opener.current?.focus({preventScroll:true});opener.current=null}} onClick={event=>{if(event.target===modal.current)modal.current.close()}}>
   <div className={styles.developerDialogBody}>
    <form method="dialog"><button ref={close} className={styles.areaClose} type="submit" aria-label={copy.closeAria}>×</button></form>
    <span className={styles.eyebrow}>{copy.eyebrow}</span>
    <h2 ref={areaHeading} tabIndex={-1} id="liry-developer-area-heading" className={styles.developerDialogHeading}>{areas.find(area=>area.id===selected)?.label}</h2>
    <p id="liry-developer-area-description" className={styles.developerDialogDescription}>{copy.notice}</p>
    <nav className={styles.developerWizardActions} aria-label={locale==="es"?"Áreas de Developers":"Developer areas"}><button type="button" disabled={currentIndex===0} onClick={()=>switchArea(-1)}>{locale==="es"?"← ANTERIOR":"← PREVIOUS"}</button><small>{currentIndex+1} / {areas.length}</small><button type="button" disabled={currentIndex===areas.length-1} onClick={()=>switchArea(1)}>{locale==="es"?"PRÓXIMO →":"NEXT →"}</button></nav>
    <div key={session}>
     {selected==="admission"&&<LiryDeveloperAdmissionPreview locale={locale}/>}
     {selected==="listing"&&<LiryDeveloperGameListingPreview locale={locale}/>}
     {selected==="release"&&<LiryDeveloperReleasePreview locale={locale}/>}
     {selected==="finance"&&<LiryDeveloperFinancePreview locale={locale}/>}
    </div>
   </div>
  </dialog>
 </>;
}
