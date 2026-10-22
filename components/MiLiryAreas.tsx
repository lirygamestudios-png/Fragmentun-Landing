"use client";
import {useRef,useState} from "react";
import Link from "next/link";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
import {MiLiryIdentityPreview} from "./MiLiryIdentityPreview";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";




const links=["/lirygames#perfil-gamer","/lirygames#mundos","/lirygames#perfil-gamer","/lirygames#tienda","/lirygames#comunidad","/lirygames#liryboost"] as const;

export function MiLiryAreas({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).miLiryAreas;
 const panels=liryFrontdeskStrings(locale).miLiryPanels;
 const facts=liryFrontdeskStrings(locale).miLiryFacts;
 const identity=liryFrontdeskStrings(locale).miLiryIdentity;
 const areas=copy.items.map((item,index)=>({...item,href:`/lirygames?lang=${locale}${links[index].slice("/lirygames".length)}`}));
 const [selected,setSelected]=useState<(typeof areas)[number]>(areas[0]);
 const [previewSession,setPreviewSession]=useState(0);
 const [openedAreaId,setOpenedAreaId]=useState<string|null>(null);
 const dialog=useRef<HTMLDialogElement>(null);
 const trigger=useRef<HTMLButtonElement|null>(null);
 const closeButton=useRef<HTMLButtonElement>(null);
 const areaHeading=useRef<HTMLHeadingElement>(null);
 const currentIndex=areas.findIndex(area=>area.id===selected.id);
 const switchArea=(direction:-1|1)=>{const next=areas[currentIndex+direction];if(next){setSelected(next);setOpenedAreaId(next.id);setPreviewSession(v=>v+1);requestAnimationFrame(()=>{if(dialog.current?.open){dialog.current.scrollTop=0;areaHeading.current?.focus({preventScroll:true});}});}};
 const openArea=(area:(typeof areas)[number],button:HTMLButtonElement)=>{
  setSelected(area);
  trigger.current=button;
  const modal=dialog.current;
  if(!modal)return;
  if(modal.open)return;
  modal.showModal();
  setOpenedAreaId(area.id);
  modal.scrollTop=0;
  requestAnimationFrame(()=>{if(modal.open)closeButton.current?.focus({preventScroll:true});});
 };
 return <><div className={styles.grid}>{areas.map(area=><article className={styles.card} key={area.id}>
  <h3>{area.title}</h3><p>{area.desc}</p><small>{area.status}</small>
  <button className={styles.areaLink} type="button" aria-haspopup="dialog" aria-controls="mi-liry-area-dialog" aria-expanded={openedAreaId===area.id} aria-label={`${copy.openAria} ${area.title}`} onClick={event=>openArea(area,event.currentTarget)}>{copy.open} →</button>
 </article>)}</div>
 <dialog id="mi-liry-area-dialog" ref={dialog} aria-modal="true" className={styles.areaDialog} aria-labelledby="mi-liry-area-title" onClose={()=>{setOpenedAreaId(null);setPreviewSession(value=>value+1);trigger.current?.focus({preventScroll:true});trigger.current=null;}} onClick={event=>{if(event.target===dialog.current)dialog.current.close()}}>
  <div className={styles.areaDialogContent}>
   <form method="dialog"><button ref={closeButton} className={styles.areaClose} aria-label={copy.closeAria} type="submit">×</button></form>
   <span className={styles.eyebrow}>{copy.eyebrow}</span>
   <h2 ref={areaHeading} tabIndex={-1} id="mi-liry-area-title">{selected.title}</h2><p>{selected.detail}</p>
   <span className={styles.areaStatus}>{selected.status}</span>
   <nav className={styles.developerWizardActions} aria-label={locale==="es"?"Menús del jugador":"Player menus"}><button type="button" disabled={currentIndex===0} aria-label={locale==="es"?`Anterior: ${areas[currentIndex-1]?.title??""}`:`Previous: ${areas[currentIndex-1]?.title??""}`} onClick={()=>switchArea(-1)}>{locale==="es"?"← ANTERIOR":"← PREVIOUS"}</button><small>{currentIndex+1} / {areas.length}</small><button type="button" disabled={currentIndex===areas.length-1} aria-label={locale==="es"?`Próximo: ${areas[currentIndex+1]?.title??""}`:`Next: ${areas[currentIndex+1]?.title??""}`} onClick={()=>switchArea(1)}>{locale==="es"?"PRÓXIMO →":"NEXT →"}</button></nav>
   {selected.id==="identidad"&&<MiLiryIdentityPreview key={previewSession} locale={locale} />}
   {selected.id==="identidad"&&<details className={styles.developerWizardDisclosure}><summary>{locale==="es"?"Ver resumen de identidad":"View identity summary"}</summary><div className={styles.identityDetails} aria-label={copy.identityAria}>
    <div><strong>{identity.publicName}</strong><span>{identity.unverified}</span></div>
    <div><strong>{identity.avatar}</strong><span>{identity.avatarPending}</span></div>
    <div><strong>{identity.preferences}</strong><span>{identity.notConfigured}</span></div>
    <p>{identity.privacyNote}</p>
   </div></details>}
   {selected.id==="identidad"&&<details className={styles.developerWizardDisclosure}><summary>{identity.securityTitle}</summary><section className={styles.identitySecurity} aria-label={copy.securityAria}>
    <p>{identity.securityNote}</p>
    <ul><li>{identity.securityRules[0]}</li><li>{identity.securityRules[1]}</li><li>{identity.securityRules[2]}</li></ul>
   </section></details>}
   {selected.id==="mundos"&&<section className={styles.worldsPanel} aria-label={copy.worldsAria}>
    <h3>{panels.mundos.title}</h3>
    <p className={styles.worldsEmpty}>{panels.mundos.empty}</p>
    <details className={styles.developerWizardDisclosure}><summary>{locale==="es"?"Ver detalles":"View details"}</summary><div className={styles.worldsFacts}>{facts.mundos.map(([label,value])=><div key={label}><strong>{label}</strong><span>{value}</span></div>)}</div></details>
    <p>{panels.mundos.note}</p>
   </section>}
   {selected.id==="logros"&&<section className={styles.worldsPanel} aria-label={copy.achievementsAria}>
    <h3>{panels.logros.title}</h3>
    <p className={styles.worldsEmpty}>{panels.logros.empty}</p>
    <details className={styles.developerWizardDisclosure}><summary>{locale==="es"?"Ver detalles":"View details"}</summary><div className={styles.worldsFacts}>{facts.logros.map(([label,value])=><div key={label}><strong>{label}</strong><span>{value}</span></div>)}</div></details>
    <p>{panels.logros.note}</p>
   </section>}
   {selected.id==="inventario"&&<section className={styles.worldsPanel} aria-label={copy.inventoryAria}>
    <h3>{panels.inventario.title}</h3>
    <p className={styles.worldsEmpty}>{panels.inventario.empty}</p>
    <details className={styles.developerWizardDisclosure}><summary>{locale==="es"?"Ver detalles":"View details"}</summary><div className={styles.worldsFacts}>{facts.inventario.map(([label,value])=><div key={label}><strong>{label}</strong><span>{value}</span></div>)}</div></details>
    <p>{panels.inventario.note}</p>
   </section>}
   {selected.id==="comunidad"&&<section className={styles.worldsPanel} aria-label={copy.communityAria}>
    <h3>{panels.comunidad.title}</h3>
    <p className={styles.worldsEmpty}>{panels.comunidad.empty}</p>
    <details className={styles.developerWizardDisclosure}><summary>{locale==="es"?"Ver detalles":"View details"}</summary><div className={styles.worldsFacts}>{facts.comunidad.map(([label,value])=><div key={label}><strong>{label}</strong><span>{value}</span></div>)}</div></details>
    <p>{panels.comunidad.note}</p>
   </section>}
   {selected.id==="liryboost"&&<section className={styles.worldsPanel} aria-label={copy.boostAria}>
    <h3>{panels.liryboost.title}</h3>
    <p className={styles.worldsEmpty}>{panels.liryboost.empty}</p>
    <details className={styles.developerWizardDisclosure}><summary>{locale==="es"?"Ver detalles":"View details"}</summary><div className={styles.worldsFacts}>{facts.liryboost.map(([label,value])=><div key={label}><strong>{label}</strong><span>{value}</span></div>)}</div></details>
    <p>{panels.liryboost.note}</p>
   </section>}
   <div className={styles.areaDialogActions}><Link className={styles.areaLink} href={selected.href}>{copy.explore} →</Link><form method="dialog"><button type="submit" className={styles.areaLink}>{copy.back}</button></form></div>
  </div>
 </dialog></>;
}
