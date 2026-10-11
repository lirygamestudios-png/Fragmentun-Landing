"use client";
import {useRef,useState} from "react";
import Link from "next/link";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
const areas=[
 {id:"identidad",title:"MI IDENTIDAD",desc:"Nombre público, avatar y preferencias",status:"Pendiente de conexión",href:"/lirygames#perfil-gamer",detail:"El perfil editable se habilitará cuando exista una sesión de jugador verificada."},
 {id:"mundos",title:"MIS MUNDOS",desc:"Historial y progreso de videojuegos verificados",status:"Sin actividad registrada",href:"/lirygames#mundos",detail:"Se mostrarán partidas y mundos únicamente cuando sus servidores confirmen la actividad."},
 {id:"logros",title:"MIS LOGROS",desc:"Insignias y recompensas acreditadas",status:"Sin logros acreditados",href:"/lirygames#perfil-gamer",detail:"No hay insignias otorgadas. Los logros requerirán eventos de juego autenticados."},
 {id:"inventario",title:"MI INVENTARIO",desc:"Artículos digitales asociados a compras verificadas",status:"Sin inventario conectado",href:"/lirygames#tienda",detail:"El inventario permanecerá vacío hasta conectar compras y entregas verificadas."},
 {id:"comunidad",title:"MI COMUNIDAD",desc:"Amistades, publicaciones y eventos",status:"Pendiente de activación",href:"/lirygames#comunidad",detail:"Las amistades, publicaciones y eventos dependerán de una identidad activa y permisos de privacidad."},
 {id:"liryboost",title:"MI LIRYBOOST",desc:"Invitaciones verificadas y participación",status:"Competencia inactiva",href:"/lirygames#liryboost",detail:"LiryBoost todavía no registra participaciones ni concede acceso beta."}
] as const;
export function MiLiryAreas(){
 const [selected,setSelected]=useState<(typeof areas)[number]>(areas[0]);
 const dialog=useRef<HTMLDialogElement>(null);
 const trigger=useRef<HTMLButtonElement|null>(null);
 return <><div className={styles.grid}>{areas.map(area=><article className={styles.card} key={area.id}>
  <h3>{area.title}</h3><p>{area.desc}</p><small>{area.status}</small>
  <button className={styles.areaLink} type="button" aria-haspopup="dialog" onClick={event=>{setSelected(area);trigger.current=event.currentTarget;dialog.current?.showModal();}}>ABRIR MI ÁREA →</button>
 </article>)}</div>
 <dialog ref={dialog} className={styles.areaDialog} aria-labelledby="mi-liry-area-title" onClose={()=>trigger.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===dialog.current)dialog.current.close()}}>
  <div className={styles.areaDialogContent}>
   <form method="dialog"><button className={styles.areaClose} aria-label="Cerrar área" type="submit">×</button></form>
   <span className={styles.eyebrow}>MI LIRY · ESPACIO PERSONAL</span>
   <h2 id="mi-liry-area-title">{selected.title}</h2><p>{selected.detail}</p>
   <span className={styles.areaStatus}>{selected.status}</span>
   <div className={styles.areaDialogActions}><Link className={styles.areaLink} href={selected.href}>EXPLORAR SECCIÓN →</Link><form method="dialog"><button type="submit" className={styles.areaLink}>VOLVER A MI LIRY</button></form></div>
  </div>
 </dialog></>;
}
