"use client";
import {useEffect,useState} from "react";
import type {LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";
import {isValidLiryDisplayName} from "../lib/games/liry-display-name-validation";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
export function LiryPlayerIdentityHeader({locale,displayName,eyebrow,note}:{locale:LiryFrontdeskLocale;displayName:string;eyebrow:string;note:string}){
 const [photo,setPhoto]=useState<string|null>(null);
 const [previewName,setPreviewName]=useState("");
 useEffect(()=>{
  const onAvatar=(event:Event)=>{if(!(event instanceof CustomEvent))return;setPhoto(typeof event.detail?.url==="string"?event.detail.url:null)};
  const onName=(event:Event)=>{if(event instanceof CustomEvent)setPreviewName(isValidLiryDisplayName(event.detail?.name)?event.detail.name:"")};
  const restoreName=()=>{
   try{
    const name=sessionStorage.getItem("liry:temporary-display-name");
    setPreviewName(name&&isValidLiryDisplayName(name)?name:"");
   }catch{setPreviewName("")}
  };
  const restoreAvatar=()=>{
   try{
    const saved=sessionStorage.getItem("liry:temporary-avatar-thumbnail");
    setPhoto(saved?.startsWith("data:image/webp;base64,")&&saved.length<180000?saved:null);
   }catch{setPhoto(null)}
  };
  restoreName();
  restoreAvatar();
  window.addEventListener("pageshow",restoreName);
  window.addEventListener("pageshow",restoreAvatar);
  window.addEventListener("liry:avatar-changed",restoreAvatar);
  window.addEventListener("liry:avatar-preview",onAvatar);
  window.addEventListener("liry:display-name-preview",onName);
  return ()=>{window.removeEventListener("pageshow",restoreName);window.removeEventListener("pageshow",restoreAvatar);window.removeEventListener("liry:avatar-changed",restoreAvatar);window.removeEventListener("liry:avatar-preview",onAvatar);window.removeEventListener("liry:display-name-preview",onName)};
 },[]);
 return <div className={styles.identity}><div className={styles.avatar} aria-label={locale==="es"?"Avatar temporal":"Temporary avatar"}>{photo?<img src={photo} alt={locale==="es"?"Fotografía del jugador":"Player photo"} className={styles.accountHeaderPhoto}/>:"◇"}</div><div><span className={styles.eyebrow}>{eyebrow}</span><h2 aria-live="polite" aria-atomic="true">{previewName||displayName}</h2><p>{note}</p></div></div>;
}
