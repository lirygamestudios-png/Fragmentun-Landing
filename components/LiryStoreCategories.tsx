"use client";
import {useRef,useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";


export function LiryStoreCategories({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).store;
 const collections=copy.categories.map(item=>({...item,tone:item.id}));

 const [selected,setSelected]=useState<(typeof collections)[number]>(collections[0]);
 const dialogRef=useRef<HTMLDialogElement>(null);
 const triggerRef=useRef<HTMLButtonElement|null>(null);
 return <>
  <div className={styles.storeCategories} aria-label={copy.categoriesAria}>
   {collections.map(item=><button type="button" key={item.name} className={styles.storeCategory} aria-haspopup="dialog" onClick={event=>{setSelected(item);triggerRef.current=event.currentTarget;dialogRef.current?.showModal()}}>
     <span className={`${styles.storeCategoryVisual} ${styles[`storeTone_${item.tone}` ]}`} aria-hidden="true"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{item.tone==="wear"?<path d="m8 4 4 2 4-2 5 4-3 4-2-1v9H8v-9l-2 1-3-4 5-4Z"/>:item.tone==="accessories"?<><circle cx="12" cy="12" r="7"/><path d="M8 5V3h8v2M9 12l3 4 3-4-3-4-3 4Z"/></>:item.tone==="collectibles"?<><path d="m12 2 8 5v10l-8 5-8-5V7l8-5Z"/><path d="m4 7 8 5 8-5M12 12v10"/></>:item.tone==="art"?<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m7 16 4-5 3 3 2-2 2 4M8 7h.01"/></>:<><rect x="3" y="7" width="18" height="11" rx="5"/><path d="M8 10v5M5.5 12.5h5M16 11h.01M18 14h.01"/></>}</svg></span><strong>{item.name}</strong><span className={styles.storeCategoryLine}/>
   </button>)}
  </div>
  <dialog ref={dialogRef} className={styles.gamerInfoDialog} aria-labelledby="liry-store-detail-title" onClose={()=>triggerRef.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===dialogRef.current)dialogRef.current.close()}}>
   <div className={styles.gamerInfoDialogInside}>
    <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label={copy.closeAria}>×</button></form>
    <p className={styles.gamerInfoEyebrow}>{copy.eyebrow}</p>
    <h3 id="liry-store-detail-title">{selected.name}</h3>
    <p>{selected.message}</p><p>{copy.unavailable}</p>
    <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>{copy.acknowledge}</button></form>
   </div>
  </dialog>
 </>;
}
