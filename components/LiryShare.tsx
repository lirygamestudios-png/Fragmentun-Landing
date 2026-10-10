"use client";
import {useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";

export function LiryShare(){
 const[copied,setCopied]=useState(false);
 function pageUrl(){return new URL("/lirygames",window.location.origin).toString();}
 async function nativeShare(){
   const data={title:"LIRYGAMES STUDIOS",text:"Descubre nuestros nueve mundos.",url:pageUrl()};
   if(typeof navigator.share==="function"){
     try{await navigator.share(data);}catch(error){if((error as Error)?.name!=="AbortError")await copyLink();}
   }else await copyLink();
 }
 async function copyLink(){
   try{await navigator.clipboard.writeText(pageUrl());setCopied(true);}
   catch{setCopied(false);}
 }
 function shareTo(provider:"whatsapp"|"facebook"|"x"){
   const url=encodeURIComponent(pageUrl());
   const title=encodeURIComponent("LIRYGAMES STUDIOS · 9 Worlds");
   const dest=provider==="whatsapp"?"https://api.whatsapp.com/send?text="+title+"%20"+url:
     provider==="facebook"?"https://www.facebook.com/sharer/sharer.php?u="+url:
     "https://twitter.com/intent/tweet?text="+title+"&url="+url;
   window.open(dest,"_blank","noopener,noreferrer");
 }
 return <div className={styles.liryShareActions} aria-label="Compartir LIRYGAMES">
   <button type="button" onClick={nativeShare} className={styles.liryShareButton}>COMPARTIR ↗</button>
   <button type="button" onClick={copyLink} className={styles.liryShareButton}>{copied?"ENLACE COPIADO ✓":"COPIAR ENLACE"}</button>
   <button type="button" onClick={()=>shareTo("whatsapp")} style={buttonStyle}>WHATSAPP ↗</button>
   <button type="button" onClick={()=>shareTo("facebook")} style={buttonStyle}>FACEBOOK ↗</button>
   <button type="button" onClick={()=>shareTo("x")} style={buttonStyle}>X ↗</button>
 </div>;
}
