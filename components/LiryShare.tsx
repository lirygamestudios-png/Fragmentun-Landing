"use client";
import {useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";

export function LiryShare(){
 const[copied,setCopied]=useState(false);
 const[shareNotice,setShareNotice]=useState("");
 function pageUrl(){return new URL("/lirygames",window.location.origin).toString();}
 async function nativeShare(){
   const data={title:"LIRYGAMES STUDIOS",text:"Descubre nuestros nueve mundos.",url:pageUrl()};
   if(typeof navigator.share==="function"){
     try{await navigator.share(data);setShareNotice("");}catch(error){if((error as Error)?.name!=="AbortError")await copyLink();}
   }else await copyLink();
 }
 async function copyLink(){
   try{await navigator.clipboard.writeText(pageUrl());setCopied(true);setShareNotice("Enlace copiado correctamente.");}
   catch{setCopied(false);setShareNotice("No se pudo copiar automáticamente. Puedes compartir la dirección de esta página desde el navegador.");}
 }
 function shareTo(provider:"whatsapp"|"facebook"|"x"){
   const url=encodeURIComponent(pageUrl());
   const title=encodeURIComponent("LIRYGAMES STUDIOS · 9 Worlds");
   const dest=provider==="whatsapp"?"https://api.whatsapp.com/send?text="+title+"%20"+url:
     provider==="facebook"?"https://www.facebook.com/sharer/sharer.php?u="+url:
     "https://twitter.com/intent/tweet?text="+title+"&url="+url;
   const newTab=window.open(dest,"_blank","noopener,noreferrer");
   if(!newTab)setShareNotice("Si no se abrió la red social, comprueba si el navegador bloqueó la ventana emergente.");
   else setShareNotice("");
 }
 return <div className={styles.liryShareActions} aria-label="Compartir LIRYGAMES">
   <button type="button" onClick={nativeShare} className={styles.liryShareButton}>COMPARTIR ↗</button>
   <button type="button" onClick={copyLink} className={styles.liryShareButton}>{copied?"ENLACE COPIADO ✓":"COPIAR ENLACE"}</button>
   <button type="button" onClick={()=>shareTo("whatsapp")} className={`${styles.liryShareButton} ${styles.liryShareIconButton}`} title="WhatsApp" aria-label="Compartir en WhatsApp"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.4l1.3-4.8A8.5 8.5 0 1 1 20.5 11.6Z"/><path d="M8.3 7.8c-.5.4-.7 1.1-.4 2 .7 2.1 3.2 4.6 5.3 5.4.9.3 1.7.1 2-.4l.6-1.2-2.4-1.2-1 1c-1.3-.6-2.3-1.6-2.9-2.9l.9-1-1.2-2.3Z"/></svg></button>
   <button type="button" onClick={()=>shareTo("facebook")} className={`${styles.liryShareButton} ${styles.liryShareIconButton}`} title="Facebook" aria-label="Compartir en Facebook"><span aria-hidden="true">f</span></button>
   <button type="button" onClick={()=>shareTo("x")} className={`${styles.liryShareButton} ${styles.liryShareIconButton}`} title="X" aria-label="Compartir en X"><span aria-hidden="true">𝕏</span></button>
  <span role="status" aria-live="polite" className={styles.socialPending}>{shareNotice}</span>
 </div>;
}
