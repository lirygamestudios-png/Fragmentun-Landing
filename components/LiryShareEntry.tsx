"use client";
import {useState} from "react";
import {resolveLiryShareUrl} from "../lib/games/liry-share-url";
import styles from "../app/lirygames/lirygames.module.css";
export function LiryShareEntry({name,locale="es"}:{name:string;locale?:"es"|"en"}){
 const [notice,setNotice]=useState("");
 async function share(){
  const url=resolveLiryShareUrl(process.env.NEXT_PUBLIC_LIRY_PUBLIC_URL,window.location.origin);
  if(!url){setNotice(locale==="es"?"Enlace no disponible":"Link unavailable");return;}
  const title=locale==="es"?"Descubre LIRYGAMES STUDIOS":"Discover LIRYGAMES STUDIOS";
  const text=locale==="es"?`Me gustó ${name}. Descubre LIRYGAMES STUDIOS.`:`I liked ${name}. Discover LIRYGAMES STUDIOS.`;
  if(navigator.share){try{await navigator.share({title,text,url});setNotice("");return;}catch(e){if((e as Error)?.name==="AbortError")return;}}
  try{await navigator.clipboard.writeText(url);setNotice(locale==="es"?"Enlace al FrontDesk copiado":"FrontDesk link copied");}catch{setNotice(url);}
 }
 return <span className={styles.liryShareEntry}><button type="button" onClick={share} aria-label={locale==="es"?`Compartir ${name}; enlace al FrontDesk`:`Share ${name}; FrontDesk link`} title={locale==="es"?"Compartir":"Share"}><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.3 10.9 7.4-4.5M8.3 13.1l7.4 4.5"/></svg></button><span role="status" aria-live="polite">{notice}</span></span>;
}
