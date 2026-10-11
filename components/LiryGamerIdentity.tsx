"use client";
import {useEffect,useRef,useState,type ChangeEvent} from "react";
import styles from "../app/lirygames/lirygames.module.css";

const VALID_STYLES=["Explorador","Estratega","Competidor","Social","Acción","Creativo"] as const;
export function LiryGamerIdentity(){
 const [avatar,setAvatar]=useState<string|null>(null);
 const [style,setStyle]=useState<string|null>(null);
 const avatarUrl=useRef<string|null>(null);
 const styleTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const fileRef=useRef<HTMLInputElement>(null);
 const dialogRef=useRef<HTMLDialogElement>(null);
 const triggerRef=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  const handler=(event:Event)=>{
   const value=(event as CustomEvent<{style:string|null}>).detail?.style;
   if(styleTimer.current){clearTimeout(styleTimer.current);styleTimer.current=null;}
   setStyle(typeof value==="string"&&VALID_STYLES.some(s=>s===value)?value:null);
  };
  const onDnaClosed=(event:Event)=>{
    const detail=(event as CustomEvent<{style:string;durationMs:number}>).detail;
    if(!detail||!VALID_STYLES.some(s=>s===detail.style))return;
    if(styleTimer.current)clearTimeout(styleTimer.current);
    setStyle(detail.style);
    styleTimer.current=setTimeout(()=>{setStyle(null);styleTimer.current=null;},10000);
  };
  window.addEventListener("liry:dna-style",handler);
  window.addEventListener("liry:dna-closed",onDnaClosed);
  return ()=>{window.removeEventListener("liry:dna-style",handler);window.removeEventListener("liry:dna-closed",onDnaClosed);if(styleTimer.current)clearTimeout(styleTimer.current);if(avatarUrl.current)URL.revokeObjectURL(avatarUrl.current)};
 },[]);
 function selectAvatar(event:ChangeEvent<HTMLInputElement>){
  const file=event.target.files?.[0];
  if(!file)return;
  if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>2*1024*1024){
   event.target.value="";window.alert("Usa JPG, PNG o WebP de hasta 2 MB.");return;
  }
  if(avatarUrl.current)URL.revokeObjectURL(avatarUrl.current);
  const url=URL.createObjectURL(file);avatarUrl.current=url;setAvatar(url);event.target.value="";
 }
 function removeAvatar(){if(avatarUrl.current)URL.revokeObjectURL(avatarUrl.current);avatarUrl.current=null;setAvatar(null)}
 return <>
  <div className={styles.gamerIdentity}>
   <button type="button" ref={triggerRef} className={styles.gamerPortrait} aria-label="Elegir avatar temporal" title="Elegir avatar" onClick={()=>dialogRef.current?.showModal()} style={{cursor:"pointer",padding:0,overflow:"hidden"}}>
    {avatar?<img src={avatar} alt="Vista previa de tu avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span>?</span>}
   </button>
   <div className={styles.gamerIdentityText}><strong>Visitante</strong><span>Nivel —</span><div className={styles.gamerXpTrack} aria-label="Experiencia pendiente de partidas verificadas"><span /></div><small>XP pendiente de actividad verificada</small></div>
  </div>
  <p className={styles.gamerMicroLabel}>Tu estilo de juego</p>
  <div className={styles.gamerStyles}><span>◇ <b>{style??"Por descubrir"}</b></span></div>
  <small className={styles.gamerDataNote}>{style?"Afinidad de tu Liry ADN. Tras cerrar la evaluación permanece visible durante 10 segundos; no equivale a progreso de juego.":"Completa el cuestionario Liry ADN para descubrir tu estilo. Sin evaluación no se asigna ninguno."}</small>
  <div className={styles.gamerMetrics}><div><small>Juegos jugados</small><strong>—</strong></div><div><small>Logros</small><strong>—</strong></div><div><small>Horas de juego</small><strong>—</strong></div></div>
  <small className={styles.gamerDataNote}>Estado visitante · sin sesión gamer. El avatar no se guarda ni se transmite.</small>
  <dialog ref={dialogRef} className={styles.gamerInfoDialog} aria-label="Avatar gamer" onClose={()=>triggerRef.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===dialogRef.current)dialogRef.current.close()}}>
   <div className={styles.gamerInfoDialogInside}>
    <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label="Cerrar subpantalla">×</button></form>
    <p className={styles.gamerInfoEyebrow}>LIRYGAMES STUDIOS · IDENTIDAD</p>
    <h3>AVATAR GAMER</h3>
    <p>Selecciona una imagen para verla como avatar durante esta visita. No se sube al servidor ni se guarda en una cuenta.</p>
    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" aria-label="Seleccionar imagen para avatar" onChange={selectAvatar}/>
    <p>JPG, PNG o WebP · máximo 2 MB.</p>
    {avatar&&<button type="button" className={styles.gamerInfoDone} onClick={removeAvatar}>QUITAR AVATAR</button>}
    <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>ENTENDIDO</button></form>
   </div>
  </dialog>
 </>;
}
