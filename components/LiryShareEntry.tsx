"use client";
import {useRef,useState} from "react";
import {resolveLiryShareUrl} from "../lib/games/liry-share-url";
import styles from "../app/lirygames/lirygames.module.css";
type ShareSection="catalog"|"store";
export function LiryShareEntry({name,locale="es",section="catalog"}:{name:string;locale?:"es"|"en";section?:ShareSection}){
 const [notice,setNotice]=useState("");
 const dialog=useRef<HTMLDialogElement>(null);
 const opener=useRef<HTMLButtonElement|null>(null);
 const es=locale==="es";
 const slogan=es?"CIENTOS DE MUNDOS, INFINITAS FORMAS DE JUGAR":"HUNDREDS OF WORLDS, INFINITE WAYS TO PLAY";
 function destination(){
  const base=resolveLiryShareUrl(process.env.NEXT_PUBLIC_LIRY_PUBLIC_URL,window.location.origin);
  if(!base)return null;
  const url=new URL(base);
  url.searchParams.set("lang",locale);
  url.hash=section==="store"?"tienda":"mundos";
  return url.toString();
 }
 function sendToWhatsApp(){
  const url=destination();
  if(!url){setNotice(es?"Enlace no disponible":"Link unavailable");return;}
  const message=es?`🎮 ${name}\n${slogan}\nDescubre LIRYGAMES STUDIOS:\n${url}`:`🎮 ${name}\n${slogan}\nDiscover LIRYGAMES STUDIOS:\n${url}`;
  window.open("https://wa.me/?text="+encodeURIComponent(message),"_blank","noopener,noreferrer");
  setNotice(es?"WhatsApp abierto. El envío depende del usuario.":"WhatsApp opened. Sending is up to the user.");
  dialog.current?.close();
 }
 return <span className={styles.liryShareEntry}>
  <button type="button" onClick={event=>{opener.current=event.currentTarget;dialog.current?.showModal()}} aria-haspopup="dialog" aria-label={es?`Compartir ${name} por WhatsApp`:`Share ${name} on WhatsApp`} title={es?"Compartir por WhatsApp":"Share on WhatsApp"}>
   <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.4l1.3-4.8A8.5 8.5 0 1 1 20.5 11.6Z"/><path d="M8.3 7.8c-.5.4-.7 1.1-.4 2 .7 2.1 3.2 4.6 5.3 5.4.9.3 1.7.1 2-.4l.6-1.2-2.4-1.2-1 1c-1.3-.6-2.3-1.6-2.9-2.9l.9-1-1.2-2.3Z"/></svg>
   <span className={styles.liryWhatsappLabel}>WhatsApp</span>
  </button>
  <span role="status" aria-live="polite">{notice}</span>
  <dialog ref={dialog} className={styles.liryWhatsappDialog} aria-label={es?"Vista previa para compartir por WhatsApp":"WhatsApp share preview"} onClose={()=>opener.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===dialog.current)dialog.current.close()}}>
   <div className={styles.liryWhatsappCard}>
    <form method="dialog"><button type="submit" className={styles.liryWhatsappClose} aria-label={es?"Cerrar":"Close"}>×</button></form>
    <div className={styles.liryWhatsappBrand}><img src="/lirygames-brand-icon.svg" width={56} height={56} alt={es?"Logotipo oficial de LIRYGAMES STUDIOS":"Official LIRYGAMES STUDIOS logo"}/><div><strong>LIRYGAMES STUDIOS</strong><p>{slogan}</p></div></div>
    <p className={styles.liryWhatsappEyebrow}>{es?"RECOMIENDA ESTA EXPERIENCIA":"RECOMMEND THIS EXPERIENCE"}</p>
    <h3>{name}</h3>
    <p>{es?"Descubre esta experiencia en LIRYGAMES STUDIOS.":"Discover this experience at LIRYGAMES STUDIOS."}</p>
    <p className={styles.liryWhatsappFootnote}>{es?"Se compartirá el nombre público y el enlace a la sección correspondiente. WhatsApp genera su propia vista previa del enlace.":"The public name and a link to the relevant section will be shared. WhatsApp generates its own link preview."}</p>
    <button type="button" className={styles.liryWhatsappSend} onClick={sendToWhatsApp}>{es?"Compartir por WhatsApp →":"Share on WhatsApp →"}</button>
   </div>
  </dialog>
 </span>;
}
