"use client";
import {useEffect,useRef,useState,type ChangeEvent} from "react";
import styles from "../app/lirygames/lirygames.module.css";
import type {PublicGamerSnapshot} from "../lib/games/public-gamer-snapshot";
import {calculateGamerXpProgress} from "../lib/games/gamer-xp";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";


import {validateTemporaryGamerAvatar,validateTemporaryGamerAvatarContent} from "../lib/games/liry-avatar-validation";


export function LiryGamerIdentity({snapshot,locale="es"}:{snapshot:Readonly<PublicGamerSnapshot>,locale?:LiryFrontdeskLocale}){
 const profileCopy=liryFrontdeskStrings(locale).gamerProfile;
 const detailCopy=liryFrontdeskStrings(locale).gamerProfileDetails;
 const VALID_STYLES=liryFrontdeskStrings(locale).gamerDna.traits;

 const verified=snapshot.status==="verified"?snapshot.verifiedActivity:null;
 const xp=verified?calculateGamerXpProgress(verified.experiencePoints):null;
 const [avatar,setAvatar]=useState<string|null>(null);
 const thumbnailKey="liry:temporary-avatar-thumbnail";
 const [style,setStyle]=useState<string|null>(null);
 const [highlight,setHighlight]=useState(false);
 const avatarUrl=useRef<string|null>(null);
 const avatarSelection=useRef(0);
 const [avatarError,setAvatarError]=useState<string|null>(null);
 const styleTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{
  try{
   const stored=sessionStorage.getItem(thumbnailKey);
   if(stored?.startsWith("data:image/webp;base64,")&&stored.length<180000)setAvatar(stored);
  }catch{}
 },[]);
 const fileRef=useRef<HTMLInputElement>(null);
 const dialogRef=useRef<HTMLDialogElement>(null);
 const triggerRef=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  const handler=(event:Event)=>{
   const value=(event as CustomEvent<{style:string|null}>).detail?.style;
   if(styleTimer.current){clearTimeout(styleTimer.current);styleTimer.current=null;}
   setHighlight(false);
   setStyle(typeof value==="string"&&VALID_STYLES.some(s=>s===value)?value:null);
  };
  const onDnaClosed=(event:Event)=>{
    const detail=(event as CustomEvent<{style:string;durationMs:number}>).detail;
    if(!detail||!VALID_STYLES.some(s=>s===detail.style))return;
    if(styleTimer.current)clearTimeout(styleTimer.current);
    setStyle(detail.style);
    setHighlight(true);
    styleTimer.current=setTimeout(()=>{setStyle(null);setHighlight(false);styleTimer.current=null;},10000);
  };
  window.addEventListener("liry:dna-style",handler);
  window.addEventListener("liry:dna-closed",onDnaClosed);
  return ()=>{window.removeEventListener("liry:dna-style",handler);window.removeEventListener("liry:dna-closed",onDnaClosed);if(styleTimer.current)clearTimeout(styleTimer.current);avatarSelection.current++;if(avatarUrl.current)URL.revokeObjectURL(avatarUrl.current)};
 },[]);
 async function selectAvatar(event:ChangeEvent<HTMLInputElement>){
  const file=event.target.files?.[0];
  if(!file)return;
  event.target.value="";
  const selection=++avatarSelection.current;
  setAvatarError(null);
  const validation=validateTemporaryGamerAvatar(file);
  if(!validation.ok){setAvatarError(detailCopy.avatarValidationError);return;}
  const validContent=await validateTemporaryGamerAvatarContent(file);
  if(selection!==avatarSelection.current)return;
  if(!validContent){setAvatarError(detailCopy.invalidFormat);return;}
  if(avatarUrl.current)URL.revokeObjectURL(avatarUrl.current);
  const url=URL.createObjectURL(file);avatarUrl.current=url;setAvatar(url);
  // Remove any previous thumbnail before asynchronously preparing the new one.
  try{sessionStorage.removeItem(thumbnailKey);window.dispatchEvent(new Event("liry:avatar-changed"))}catch{}
  // Compact session-only preview for the public header; never upload the avatar.
  try{
   const bitmap=await createImageBitmap(file);
   if(selection!==avatarSelection.current){bitmap.close();return;}
   const canvas=document.createElement("canvas");canvas.width=64;canvas.height=64;
   const context=canvas.getContext("2d");if(context){
    const edge=Math.min(bitmap.width,bitmap.height);
    context.drawImage(bitmap,(bitmap.width-edge)/2,(bitmap.height-edge)/2,edge,edge,0,0,64,64);
    const thumbnail=canvas.toDataURL("image/webp",0.72);
    if(selection===avatarSelection.current&&thumbnail.length<180000){sessionStorage.setItem(thumbnailKey,thumbnail);window.dispatchEvent(new Event("liry:avatar-changed"));}
   }
   bitmap.close();
  }catch{}

 }
 function removeAvatar(){
  avatarSelection.current++;
  if(avatarUrl.current)URL.revokeObjectURL(avatarUrl.current);
  avatarUrl.current=null;setAvatar(null);setAvatarError(null);
  try{sessionStorage.removeItem(thumbnailKey);window.dispatchEvent(new Event("liry:avatar-changed"))}catch{}
 }
 return <>
  <div className={styles.gamerIdentity}>
   <button type="button" ref={triggerRef} className={styles.gamerPortrait} aria-label={profileCopy.avatar} title={detailCopy.chooseTitle} onClick={()=>{setAvatarError(null);dialogRef.current?.showModal()}} style={{cursor:"pointer",padding:0,overflow:"hidden"}}>
    {avatar?<img src={avatar} alt={detailCopy.previewAlt} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span>?</span>}
   </button>
   <div className={styles.gamerIdentityText}><strong>{snapshot.displayName}</strong><span>{xp?`${detailCopy.level} ${xp.level}`:`${detailCopy.level} —`}</span><div className={styles.gamerXpTrack} role="progressbar" aria-label={xp?detailCopy.xpProgress:detailCopy.xpPending} aria-valuemin={xp?0:undefined} aria-valuemax={xp?100:undefined} aria-valuenow={xp?xp.progressPercent:undefined} aria-valuetext={xp?`${xp.currentLevelXp}/${xp.nextLevelXp} XP · ${detailCopy.xpTowardNextLevel}`:detailCopy.noVerifiedActivity}><span style={xp?{width:`${xp.progressPercent}%`,transition:"width .5s ease"}:undefined}/></div><small>{xp?`${xp.currentLevelXp}/${xp.nextLevelXp} XP · ${detailCopy.xpTotal}: ${xp.totalXp}`:profileCopy.noActivity}</small></div>
  </div>
  <p className={styles.gamerMicroLabel}>{detailCopy.playStyle}</p>
  <div className={`${styles.gamerStyles} ${highlight?styles.gamerStylesHighlighted:""}`} aria-live="polite" aria-atomic="true"><span>◇ <b>{style??detailCopy.undiscovered}</b></span></div>
  <small className={styles.gamerDataNote}>{style?detailCopy.styleHint:detailCopy.styleIntro}</small>
  <div className={styles.gamerMetrics}><div><small>{detailCopy.gamesPlayed}</small><strong>{verified?verified.gamesPlayed:"—"}</strong></div><div><small>{detailCopy.achievements}</small><strong>{verified?verified.achievedCount:"—"}</strong></div><div><small>{detailCopy.playHours}</small><strong>{verified?(verified.playMinutes/60).toFixed(1):"—"}</strong></div></div>
  <small className={styles.gamerDataNote}>{verified?detailCopy.verifiedActivity:profileCopy.noSession}</small>
  <dialog ref={dialogRef} className={styles.gamerInfoDialog} aria-label={detailCopy.avatarDialog} onClose={()=>triggerRef.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===dialogRef.current)dialogRef.current.close()}}>
   <div className={styles.gamerInfoDialogInside}>
    <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label={detailCopy.close}>×</button></form>
    <p className={styles.gamerInfoEyebrow}>{detailCopy.avatarEyebrow}</p>
    <h3>{detailCopy.avatarDialog}</h3>
    <p>{detailCopy.avatarHelp}</p>
    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" aria-label={detailCopy.avatarSelect} onChange={selectAvatar}/>
    <p>{detailCopy.avatarFormat}</p>
    {avatarError&&<p role="alert" className={styles.gamerDataNote}>{avatarError}</p>}
    {avatar&&<button type="button" className={styles.gamerInfoDone} onClick={removeAvatar}>{detailCopy.removeAvatar}</button>}
    <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>{detailCopy.done}</button></form>
   </div>
  </dialog>
 </>;
}
