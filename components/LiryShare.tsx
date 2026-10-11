"use client";
import {useRef,useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";
import {resolveLiryShareUrl} from "../lib/games/liry-share-url";

export function LiryShare(){
 const[copied,setCopied]=useState(false);
 const previewRef=useRef<HTMLDialogElement>(null);
 const previewTrigger=useRef<HTMLButtonElement|null>(null);
 const[shareNotice,setShareNotice]=useState("");
 function pageUrl(){return resolveLiryShareUrl(process.env.NEXT_PUBLIC_LIRY_PUBLIC_URL,window.location.origin)??new URL("/lirygames",window.location.origin).toString();}
 async function nativeShare(){
   const data={title:"LIRYGAMES STUDIOS",text:"Descubre nuestros nueve mundos.",url:pageUrl()};
   if(typeof navigator.share==="function"){
     try{await navigator.share(data);setShareNotice("Contenido compartido desde el dispositivo.");}catch(error){if((error as Error)?.name!=="AbortError")await copyLink();else setShareNotice("Compartir cancelado.");}
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
   // Con noopener algunos navegadores devuelven null aunque la pestaña se abra correctamente.
   window.open(dest,"_blank","noopener,noreferrer");
   setShareNotice("Se solicitó abrir la red social. Si no aparece una nueva pestaña, utiliza COMPARTIR o COPIAR ENLACE. La publicación depende de la red social.");
 }
 return <><div className={styles.liryShareActions} aria-label="Compartir LIRYGAMES">
   <button type="button" onClick={nativeShare} className={styles.liryShareButton}>COMPARTIR ↗</button>
   <button type="button" onClick={copyLink} className={styles.liryShareButton}>{copied?"ENLACE COPIADO ✓":"COPIAR ENLACE"}</button>
   <button type="button" onClick={()=>shareTo("whatsapp")} className={`${styles.liryShareButton} ${styles.liryShareIconButton}`} title="WhatsApp" aria-label="Compartir en WhatsApp"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.4l1.3-4.8A8.5 8.5 0 1 1 20.5 11.6Z"/><path d="M8.3 7.8c-.5.4-.7 1.1-.4 2 .7 2.1 3.2 4.6 5.3 5.4.9.3 1.7.1 2-.4l.6-1.2-2.4-1.2-1 1c-1.3-.6-2.3-1.6-2.9-2.9l.9-1-1.2-2.3Z"/></svg></button>
   <button type="button" onClick={()=>shareTo("facebook")} className={`${styles.liryShareButton} ${styles.liryShareIconButton}`} title="Facebook" aria-label="Compartir en Facebook"><span aria-hidden="true">f</span></button>
   <button type="button" onClick={()=>shareTo("x")} className={`${styles.liryShareButton} ${styles.liryShareIconButton}`} title="X" aria-label="Compartir en X"><span aria-hidden="true">𝕏</span></button>
  <button type="button" className={styles.liryShareButton} aria-haspopup="dialog" onClick={event=>{previewTrigger.current=event.currentTarget;previewRef.current?.showModal()}}>VER TARJETA ↗</button>
  <span role="status" aria-live="polite" className={styles.socialPending}>{shareNotice}</span>
 </div>
 <dialog ref={previewRef} className={styles.gamerInfoDialog} aria-label="Vista previa de tarjeta para compartir LIRYGAMES" onClose={()=>previewTrigger.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===previewRef.current)previewRef.current.close()}}>
  <div className={styles.gamerInfoDialogInside}>
   <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label="Cerrar vista previa">×</button></form>
   <p className={styles.gamerInfoEyebrow}>LIRYGAMES STUDIOS · COMPARTIR</p>
   <h3>TARJETA PARA COMPARTIR</h3>
   <img src="/lirygames/opengraph-image" width={1200} height={630} loading="lazy" alt="LIRYGAMES STUDIOS: 9 mundos, infinitas formas de jugar" style={{display:"block",width:"100%",height:"auto",borderRadius:8,border:"1px solid #286e98"}}/>
   <p>Vista previa de nuestra tarjeta. Cada red social decide cómo presenta el enlace.</p>
   <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>ENTENDIDO</button></form>
  </div>
 </dialog></>;
}
