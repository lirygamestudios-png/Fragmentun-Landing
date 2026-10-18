"use client";
import {useEffect,useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";
const key="liry:temporary-avatar-thumbnail";
export function LiryFrontdeskProfileAccess({locale,label,aria,title}:{locale:"es"|"en";label:string;aria:string;title:string}){
 const [photo,setPhoto]=useState<string|null>(null);
 useEffect(()=>{
  try{const saved=sessionStorage.getItem(key);if(saved?.startsWith("data:image/")&&saved.length<180000)setPhoto(saved)}catch{}
 },[]);
 return <a className={styles.profileAccess} href={`/lirygames/mi-liry?lang=${locale}`} aria-label={aria} title={title}>{photo?<img src={photo} alt="" width={28} height={28} style={{width:28,height:28,objectFit:"cover",borderRadius:"50%"}}/>:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.5-4 3-6 7-6s6.5 2 7 6"/></svg>}<span>{label}</span></a>;
}
