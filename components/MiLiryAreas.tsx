"use client";
import {useRef,useState} from "react";
import Link from "next/link";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
import {MiLiryIdentityPreview} from "./MiLiryIdentityPreview";
import {liryFrontdeskStrings} from "../lib/games/liry-frontdesk-i18n";
const copy=liryFrontdeskStrings("es").miLiryAreas;
const panels=liryFrontdeskStrings("es").miLiryPanels;
const identity=liryFrontdeskStrings("es").miLiryIdentity;
const links=["/lirygames#perfil-gamer","/lirygames#mundos","/lirygames#perfil-gamer","/lirygames#tienda","/lirygames#comunidad","/lirygames#liryboost"] as const;
const areas=copy.items.map((item,index)=>({...item,href:links[index]}));
export function MiLiryAreas(){
 const [selected,setSelected]=useState<(typeof areas)[number]>(areas[0]);
 const [previewSession,setPreviewSession]=useState(0);
 const dialog=useRef<HTMLDialogElement>(null);
 const trigger=useRef<HTMLButtonElement|null>(null);
 const closeButton=useRef<HTMLButtonElement>(null);
 const openArea=(area:(typeof areas)[number],button:HTMLButtonElement)=>{
  setSelected(area);
  trigger.current=button;
  const modal=dialog.current;
  if(!modal)return;
  if(modal.open)return;
  modal.showModal();
  modal.scrollTop=0;
  requestAnimationFrame(()=>{if(modal.open)closeButton.current?.focus({preventScroll:true});});
 };
 return <><div className={styles.grid}>{areas.map(area=><article className={styles.card} key={area.id}>
  <h3>{area.title}</h3><p>{area.desc}</p><small>{area.status}</small>
  <button className={styles.areaLink} type="button" aria-haspopup="dialog" aria-label={`Abrir ${area.title}`} onClick={event=>openArea(area,event.currentTarget)}>{copy.open} →</button>
 </article>)}</div>
 <dialog ref={dialog} className={styles.areaDialog} aria-labelledby="mi-liry-area-title" onClose={()=>{setPreviewSession(value=>value+1);trigger.current?.focus({preventScroll:true});trigger.current=null;}} onClick={event=>{if(event.target===dialog.current)dialog.current.close()}}>
  <div className={styles.areaDialogContent}>
   <form method="dialog"><button ref={closeButton} className={styles.areaClose} aria-label="Cerrar área y volver a MI LIRY" type="submit">×</button></form>
   <span className={styles.eyebrow}>{copy.eyebrow}</span>
   <h2 id="mi-liry-area-title">{selected.title}</h2><p>{selected.detail}</p>
   <span className={styles.areaStatus}>{selected.status}</span>
   {selected.id==="identidad"&&<div className={styles.identityDetails} aria-label="Preparación de identidad del jugador">
    <div><strong>{identity.publicName}</strong><span>{identity.unverified}</span></div>
    <div><strong>{identity.avatar}</strong><span>{identity.avatarPending}</span></div>
    <div><strong>{identity.preferences}</strong><span>{identity.notConfigured}</span></div>
    <p>{identity.privacyNote}</p>
   </div>}
   {selected.id==="identidad"&&<MiLiryIdentityPreview key={previewSession} />}
   {selected.id==="identidad"&&<section className={styles.identitySecurity} aria-label="Seguridad del perfil">
    <h3>{identity.securityTitle}</h3>
    <p>{identity.securityNote}</p>
    <ul><li>{identity.securityRules[0]}</li><li>{identity.securityRules[1]}</li><li>{identity.securityRules[2]}</li></ul>
   </section>}
   {selected.id==="mundos"&&<section className={styles.worldsPanel} aria-label="Estado de mundos del jugador">
    <h3>{panels.mundos.title}</h3>
    <p className={styles.worldsEmpty}>{panels.mundos.empty}</p>
    <div className={styles.worldsFacts}><div><strong>JUEGOS VINCULADOS</strong><span>Sin datos verificados</span></div><div><strong>ÚLTIMA PARTIDA</strong><span>No disponible</span></div><div><strong>PROGRESO</strong><span>No disponible</span></div></div>
    <p>{panels.mundos.note}</p>
   </section>}
   {selected.id==="logros"&&<section className={styles.worldsPanel} aria-label="Estado de logros y recompensas">
    <h3>{panels.logros.title}</h3>
    <p className={styles.worldsEmpty}>{panels.logros.empty}</p>
    <div className={styles.worldsFacts}>
     <div><strong>INSIGNIAS</strong><span>Sin datos verificados</span></div>
     <div><strong>DESAFÍOS</strong><span>No disponibles</span></div>
     <div><strong>RECOMPENSAS</strong><span>No acreditadas</span></div>
    </div>
    <p>{panels.logros.note}</p>
   </section>}
   {selected.id==="inventario"&&<section className={styles.worldsPanel} aria-label="Inventario digital verificado">
    <h3>{panels.inventario.title}</h3>
    <p className={styles.worldsEmpty}>{panels.inventario.empty}</p>
    <div className={styles.worldsFacts}>
     <div><strong>SKINS Y APARIENCIAS</strong><span>Sin datos verificados</span></div>
     <div><strong>OBJETOS DE JUEGO</strong><span>No disponibles</span></div>
     <div><strong>COMPRAS Y ENTREGAS</strong><span>Sin conexión</span></div>
    </div>
    <p>{panels.inventario.note}</p>
   </section>}
   {selected.id==="comunidad"&&<section className={styles.worldsPanel} aria-label="Estado de Mi Comunidad">
    <h3>{panels.comunidad.title}</h3>
    <p className={styles.worldsEmpty}>{panels.comunidad.empty}</p>
    <div className={styles.worldsFacts}>
     <div><strong>MIS AMISTADES</strong><span>Sin datos verificados</span></div>
     <div><strong>MIS PUBLICACIONES</strong><span>No disponibles</span></div>
     <div><strong>EVENTOS</strong><span>Pendientes de activación</span></div>
    </div>
    <p>{panels.comunidad.note}</p>
   </section>}
   {selected.id==="liryboost"&&<section className={styles.worldsPanel} aria-label="Estado de participación en LiryBoost">
    <h3>{panels.liryboost.title}</h3>
    <p className={styles.worldsEmpty}>{panels.liryboost.empty}</p>
    <div className={styles.worldsFacts}>
     <div><strong>INVITACIONES VÁLIDAS</strong><span>Sin datos verificados</span></div>
     <div><strong>MI POSICIÓN</strong><span>Sin clasificación activa</span></div>
     <div><strong>ACCESO A BETA</strong><span>No asignado</span></div>
    </div>
    <p>{panels.liryboost.note}</p>
   </section>}
   <div className={styles.areaDialogActions}><Link className={styles.areaLink} href={selected.href}>{copy.explore} →</Link><form method="dialog"><button type="submit" className={styles.areaLink}>{copy.back}</button></form></div>
  </div>
 </dialog></>;
}
