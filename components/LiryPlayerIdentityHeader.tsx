"use client";
import {useEffect,useState} from "react";
import type {LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
export function LiryPlayerIdentityHeader({locale,displayName,eyebrow,note}:{locale:LiryFrontdeskLocale;displayName:string;eyebrow:string;note:string}){
 const [photo,setPhoto]=useState<string|null>(null);
 useEffect(()=>{
  const onAvatar=(event:Event)=>{if(!(event instanceof CustomEvent))return;setPhoto(typeof event.detail?.url==="string"?event.detail.url:null)};
  window.addEventListener("liry:avatar-preview",onAvatar);
  return ()=>window.removeEventListener("liry:avatar-preview",onAvatar);
 },[]);
 return <div className={styles.identity}><div className={styles.avatar} aria-label={locale==="es"?"Avatar temporal":"Temporary avatar"}>{photo?<img src={photo} alt={locale==="es"?"Fotografía del jugador":"Player photo"} className={styles.accountHeaderPhoto}/>:"◇"}</div><div><span className={styles.eyebrow}>{eyebrow}</span><h2>{displayName}</h2><p>{note}</p></div></div>;
}
