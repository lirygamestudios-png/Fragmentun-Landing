"use client";
import {useEffect,useRef,useState,type ChangeEvent} from "react";
import styles from "../app/lirygames/lirygames.module.css";
import type {PublicGamerSnapshot} from "../lib/games/public-gamer-snapshot";
import {calculateGamerXpProgress} from "../lib/games/gamer-xp";
import {liryFrontdeskStrings} from "../lib/games/liry-frontdesk-i18n";
const profileCopy=liryFrontdeskStrings("es").gamerProfile;
import {validateTemporaryGamerAvatar,validateTemporaryGamerAvatarContent} from "../lib/games/liry-avatar-validation";

const VALID_STYLES=liryFrontdeskStrings("es").gamerDna.traits;
export function LiryGamerIdentity({snapshot}:{snapshot:Readonly<PublicGamerSnapshot>}){
 const verified=snapshot.status==="verified"?snapshot.verifiedActivity:null;
 const xp=verified?calculateGamerXpProgress(verified.experiencePoints):null;
 const [avatar,setAvatar]=useState<string|null>(null);
 const [style,setStyle]=useState<string|null>(null);
 const [highlight,setHighlight]=useState(false);
 const avatarUrl=useRef<string|null>(null);
 const avatarSelection=useRef(0);
 const [avatarError,setAvatarError]=useState<string|null>(null);
 const styleTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
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
  if(!validation.ok){setAvatarError(validation.message);return;}
  const validContent=await validateTemporaryGamerAvatarContent(file);
  if(selection!==avatarSelection.current)return;
  if(!validContent){setAvatarError("La imagen no coincide con su formato declarado.");return;}
  if(avatarUrl.current)URL.revokeObjectURL(avatarUrl.current);
  const url=URL.createObjectURL(file);avatarUrl.current=url;setAvatar(url);
 }
 function removeAvatar(){
  avatarSelection.current++;
  if(avatarUrl.current)URL.revokeObjectURL(avatarUrl.current);
  avatarUrl.current=null;setAvatar(null);setAvatarError(null);
 }
 return <>
  <div className={styles.gamerIdentity}>
   <button type="button" ref={triggerRef} className={styles.gamerPortrait} aria-label={profileCopy.avatar} title="Elegir avatar" onClick={()=>dialogRef.current?.showModal()} style={{cursor:"pointer",padding:0,overflow:"hidden"}}>
    {avatar?<img src={avatar} alt="Vista previa de tu avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span>?</span>}
   </button>
   <div className={styles.gamerIdentityText}><strong>{snapshot.displayName}</strong><span>{xp?`Nivel ${xp.level}`:"Nivel —"}</span><div className={styles.gamerXpTrack} role="progressbar" aria-label={xp?"Progreso al siguiente nivel":"Experiencia pendiente de partidas verificadas"} aria-valuemin={xp?0:undefined} aria-valuemax={xp?100:undefined} aria-valuenow={xp?xp.progressPercent:undefined} aria-valuetext={xp?`${xp.currentLevelXp} de ${xp.nextLevelXp} XP hacia el siguiente nivel`:"Sin actividad verificada"}><span style={xp?{width:`${xp.progressPercent}%`,transition:"width .5s ease"}:undefined}/></div><small>{xp?`${xp.currentLevelXp}/${xp.nextLevelXp} XP · Total: ${xp.totalXp}`:"XP pendiente de actividad verificada"}</small></div>
  </div>
  <p className={styles.gamerMicroLabel}>Tu estilo de juego</p>
  <div className={`${styles.gamerStyles} ${highlight?styles.gamerStylesHighlighted:""}`} aria-live="polite"><span>◇ <b>{style??"Por descubrir"}</b></span></div>
  <small className={styles.gamerDataNote}>{style?"Afinidad de tu Liry ADN. Tras cerrar la evaluación permanece visible durante 10 segundos; no equivale a progreso de juego.":"Completa el cuestionario Liry ADN para descubrir tu estilo. Sin evaluación no se asigna ninguno."}</small>
  <div className={styles.gamerMetrics}><div><small>Juegos jugados</small><strong>{verified?verified.gamesPlayed:"—"}</strong></div><div><small>Logros</small><strong>{verified?verified.achievedCount:"—"}</strong></div><div><small>Horas de juego</small><strong>{verified?(verified.playMinutes/60).toFixed(1):"—"}</strong></div></div>
  <small className={styles.gamerDataNote}>{verified?"Actividad recibida desde una fuente verificada. El avatar seleccionado sigue siendo temporal y no se transmite.":"Estado visitante · sin sesión gamer. El avatar no se guarda ni se transmite."}</small>
  <dialog ref={dialogRef} className={styles.gamerInfoDialog} aria-label="Avatar gamer" onClose={()=>triggerRef.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===dialogRef.current)dialogRef.current.close()}}>
   <div className={styles.gamerInfoDialogInside}>
    <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label="Cerrar subpantalla">×</button></form>
    <p className={styles.gamerInfoEyebrow}>LIRYGAMES STUDIOS · IDENTIDAD</p>
    <h3>AVATAR GAMER</h3>
    <p>Selecciona una imagen para verla como avatar durante esta visita. No se sube al servidor ni se guarda en una cuenta.</p>
    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" aria-label="Seleccionar imagen para avatar" onChange={selectAvatar}/>
    <p>JPG, PNG o WebP · máximo 2 MB.</p>
    {avatarError&&<p role="alert" className={styles.gamerDataNote}>{avatarError}</p>}
    {avatar&&<button type="button" className={styles.gamerInfoDone} onClick={removeAvatar}>QUITAR AVATAR</button>}
    <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>ENTENDIDO</button></form>
   </div>
  </dialog>
 </>;
}
